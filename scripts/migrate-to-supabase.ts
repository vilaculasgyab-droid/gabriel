import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { Product, Order } from '../src/types';
import { mapProductToDbRow, mapOrderToDbRow } from '../src/lib/supabase';

// Helper to resolve paths relative to project root
const ROOT_DIR = process.cwd();
const PRODUCTS_JSON = path.join(ROOT_DIR, 'data', 'products.json');
const ORDERS_JSON = path.join(ROOT_DIR, 'data', 'orders.json');
const PUBLIC_PRODUCTS_DIR = path.join(ROOT_DIR, 'public', 'products');
const PUBLIC_UPLOADS_DIR = path.join(ROOT_DIR, 'public', 'uploads', 'products');

const BUCKET_NAME = 'product-images';

function getMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.png':
      return 'image/png';
    case '.webp':
      return 'image/webp';
    case '.svg':
      return 'image/svg+xml';
    default:
      return 'application/octet-stream';
  }
}

/**
 * Procura um arquivo de imagem local nos diretórios do projeto
 */
function findLocalImageFile(rawImagePath: string): string | null {
  if (!rawImagePath || rawImagePath.startsWith('http') || rawImagePath.startsWith('data:')) {
    return null;
  }

  const cleanPath = rawImagePath.split('?')[0];
  const fileName = path.basename(cleanPath);

  // 1. Procurar em public/products/fileName
  const inProducts = path.join(PUBLIC_PRODUCTS_DIR, fileName);
  if (fs.existsSync(inProducts)) {
    return inProducts;
  }

  // 2. Procurar em public/uploads/products/fileName
  const inUploads = path.join(PUBLIC_UPLOADS_DIR, fileName);
  if (fs.existsSync(inUploads)) {
    return inUploads;
  }

  // 3. Procurar em public + cleanPath
  const inPublic = path.join(ROOT_DIR, 'public', cleanPath.startsWith('/') ? cleanPath.slice(1) : cleanPath);
  if (fs.existsSync(inPublic)) {
    return inPublic;
  }

  return null;
}

export async function runMigration() {
  console.log('====================================================');
  console.log('🚀 FORTIMOZ - MIGRAÇÃO DE DADOS PARA SUPABASE');
  console.log('====================================================\n');

  // 1. Validar Credenciais
  const supabaseUrl = (
    process.env.SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL ||
    ''
  ).trim();

  const supabaseKey = (
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    ''
  ).trim();

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ ERRO: Variáveis de ambiente do Supabase não encontradas!');
    console.error('Configure as seguintes variáveis no seu ambiente (.env ou secrets):');
    console.error('  - SUPABASE_URL (ou VITE_SUPABASE_URL)');
    console.error('  - SUPABASE_SERVICE_ROLE_KEY (ou VITE_SUPABASE_ANON_KEY)');
    return {
      success: false,
      error: 'Supabase credentials not configured in environment',
    };
  }

  console.log(`📡 Conectando ao Supabase: ${supabaseUrl}`);
  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false },
  });

  // 2. Assegurar Bucket de Storage 'product-images'
  console.log(`\n📦 Verificando bucket de Storage "${BUCKET_NAME}"...`);
  try {
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    if (listError) {
      console.warn(`⚠️ Não foi possível listar os buckets existentes (${listError.message}). Tentando criar ou usar diretamente.`);
    }

    const bucketExists = buckets?.some((b) => b.name === BUCKET_NAME);
    if (!bucketExists) {
      console.log(`Criando bucket público "${BUCKET_NAME}"...`);
      const { error: createBucketError } = await supabase.storage.createBucket(BUCKET_NAME, {
        public: true,
        fileSizeLimit: 10 * 1024 * 1024, // 10MB
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'],
      });
      if (createBucketError) {
        console.warn(`Aviso ao criar bucket: ${createBucketError.message}`);
      } else {
        console.log(`✅ Bucket "${BUCKET_NAME}" criado com sucesso!`);
      }
    } else {
      console.log(`✅ Bucket "${BUCKET_NAME}" já existe e está pronto.`);
    }
  } catch (err: any) {
    console.warn(`Aviso no storage: ${err?.message}`);
  }

  // 3. Ler produtos locais
  console.log(`\n📂 Lendo catálogo local de produtos em: ${PRODUCTS_JSON}`);
  if (!fs.existsSync(PRODUCTS_JSON)) {
    console.error(`❌ Arquivo ${PRODUCTS_JSON} não encontrado!`);
    return { success: false, error: 'products.json not found' };
  }

  const localProductsRaw = fs.readFileSync(PRODUCTS_JSON, 'utf-8');
  const localProducts: Product[] = JSON.parse(localProductsRaw);
  console.log(`📊 Encontrados ${localProducts.length} produtos locais para migração.`);

  let imagesUploadedCount = 0;
  let productsInsertedCount = 0;
  let productsUpdatedCount = 0;
  const errors: string[] = [];

  // Mapeamento de uploads para evitar upload duplicado da mesma imagem
  const uploadedUrlsMap = new Map<string, string>();

  // 4. Migrar imagens e produtos
  console.log('\n====================================================');
  console.log('🔄 INICIANDO MIGRAÇÃO DOS PRODUTOS E IMAGENS');
  console.log('====================================================\n');

  for (let i = 0; i < localProducts.length; i++) {
    const p = localProducts[i];
    const indexStr = `[${i + 1}/${localProducts.length}]`;
    console.log(`${indexStr} Processando: "${p.name}" (ID: ${p.id})`);

    let finalImageUrl = p.image;

    // Se a imagem já for uma URL do Supabase Storage, mantemos
    if (finalImageUrl && finalImageUrl.includes(BUCKET_NAME)) {
      console.log(`   ℹ️ Imagem já no Supabase Storage: ${finalImageUrl}`);
    } else if (finalImageUrl) {
      // Localizar o arquivo físico
      const localFilePath = findLocalImageFile(finalImageUrl);

      if (localFilePath && fs.existsSync(localFilePath)) {
        const fileName = path.basename(localFilePath);
        
        // Verificar se já subimos esse arquivo exato nesta sessão
        if (uploadedUrlsMap.has(fileName)) {
          finalImageUrl = uploadedUrlsMap.get(fileName)!;
          console.log(`   ♻️ Imagem já carregada anteriormente nesta sessão: ${finalImageUrl}`);
        } else {
          try {
            const fileBuffer = fs.readFileSync(localFilePath);
            const mimeType = getMimeType(localFilePath);
            const destinationPath = fileName; // Mantém nome limpo e direto no bucket

            console.log(`   ⬆️ Fazendo upload real de "${fileName}" (${(fileBuffer.length / 1024).toFixed(1)} KB)...`);

            const { error: uploadError } = await supabase.storage
              .from(BUCKET_NAME)
              .upload(destinationPath, fileBuffer, {
                contentType: mimeType,
                cacheControl: '3600',
                upsert: true,
              });

            if (uploadError) {
              console.error(`   ❌ Erro ao enviar imagem "${fileName}": ${uploadError.message}`);
              errors.push(`Imagem ${fileName} do produto ${p.id}: ${uploadError.message}`);
            } else {
              const { data: publicUrlData } = supabase.storage
                .from(BUCKET_NAME)
                .getPublicUrl(destinationPath);

              // Cache busting com timestamp do arquivo ou atual
              const stat = fs.statSync(localFilePath);
              const vToken = Math.floor(stat.mtimeMs) || Date.now();
              finalImageUrl = `${publicUrlData.publicUrl}?v=${vToken}`;
              uploadedUrlsMap.set(fileName, finalImageUrl);
              imagesUploadedCount++;
              console.log(`   ✅ Imagem disponível em: ${finalImageUrl}`);
            }
          } catch (uploadErr: any) {
            console.error(`   ❌ Exceção ao carregar "${fileName}":`, uploadErr?.message);
            errors.push(`Imagem ${fileName}: ${uploadErr?.message}`);
          }
        }
      } else {
        console.warn(`   ⚠️ Arquivo local não encontrado para: ${finalImageUrl}`);
      }
    }

    // Migrar imagens adicionais se existirem
    let finalAdditionalImages: string[] = [];
    if (p.additionalImages && Array.isArray(p.additionalImages)) {
      for (const addImg of p.additionalImages) {
        if (!addImg) continue;
        if (addImg.includes(BUCKET_NAME)) {
          finalAdditionalImages.push(addImg);
          continue;
        }
        const addLocalPath = findLocalImageFile(addImg);
        if (addLocalPath && fs.existsSync(addLocalPath)) {
          const addFileName = path.basename(addLocalPath);
          if (uploadedUrlsMap.has(addFileName)) {
            finalAdditionalImages.push(uploadedUrlsMap.get(addFileName)!);
          } else {
            try {
              const addBuf = fs.readFileSync(addLocalPath);
              const addMime = getMimeType(addLocalPath);
              const { error: addErr } = await supabase.storage
                .from(BUCKET_NAME)
                .upload(addFileName, addBuf, {
                  contentType: addMime,
                  cacheControl: '3600',
                  upsert: true,
                });
              if (!addErr) {
                const { data: addUrlData } = supabase.storage
                  .from(BUCKET_NAME)
                  .getPublicUrl(addFileName);
                const addFullUrl = `${addUrlData.publicUrl}?v=${Date.now()}`;
                uploadedUrlsMap.set(addFileName, addFullUrl);
                finalAdditionalImages.push(addFullUrl);
                imagesUploadedCount++;
              }
            } catch (e: any) {
              console.warn(`   ⚠️ Falha ao subir imagem adicional ${addFileName}:`, e?.message);
            }
          }
        } else {
          finalAdditionalImages.push(addImg);
        }
      }
    }

    // Preparar objeto de dados para o Supabase
    const productToSave: Product = {
      ...p,
      image: finalImageUrl,
      additionalImages: finalAdditionalImages.length > 0 ? finalAdditionalImages : undefined,
    };

    const dbRow = mapProductToDbRow(productToSave);

    // Verificar se já existe no Supabase pelo ID
    try {
      const { data: existing, error: checkError } = await supabase
        .from('products')
        .select('id')
        .eq('id', p.id)
        .maybeSingle();

      if (checkError) {
        console.warn(`   ⚠️ Aviso ao verificar produto ${p.id}: ${checkError.message}`);
      }

      if (existing) {
        // Atualizar produto existente
        const { error: updateError } = await supabase
          .from('products')
          .update(dbRow)
          .eq('id', p.id);

        if (updateError) {
          console.error(`   ❌ Falha ao atualizar produto ${p.id}: ${updateError.message}`);
          errors.push(`Produto ${p.id} update: ${updateError.message}`);
        } else {
          productsUpdatedCount++;
          console.log(`   ✅ Produto atualizado no Supabase (ID: ${p.id})`);
        }
      } else {
        // Inserir novo produto
        const { error: insertError } = await supabase
          .from('products')
          .insert(dbRow);

        if (insertError) {
          console.error(`   ❌ Falha ao inserir produto ${p.id}: ${insertError.message}`);
          errors.push(`Produto ${p.id} insert: ${insertError.message}`);
        } else {
          productsInsertedCount++;
          console.log(`   ✅ Produto inserido no Supabase (ID: ${p.id})`);
        }
      }
    } catch (dbErr: any) {
      console.error(`   ❌ Exceção ao gravar no banco:`, dbErr?.message);
      errors.push(`Produto ${p.id} db exception: ${dbErr?.message}`);
    }
  }

  // 5. Migrar Pedidos (se existirem)
  console.log('\n====================================================');
  console.log('📦 VERIFICANDO PEDIDOS EM data/orders.json');
  console.log('====================================================\n');

  let ordersMigratedCount = 0;
  if (fs.existsSync(ORDERS_JSON)) {
    try {
      const ordersRaw = fs.readFileSync(ORDERS_JSON, 'utf-8');
      const ordersList: Order[] = JSON.parse(ordersRaw);
      if (Array.isArray(ordersList) && ordersList.length > 0) {
        console.log(`Encontrados ${ordersList.length} pedidos para migrar.`);
        for (const order of ordersList) {
          const orderRow = mapOrderToDbRow(order);
          const { error: orderErr } = await supabase
            .from('orders')
            .upsert(orderRow, { onConflict: 'id' });
          if (orderErr) {
            console.error(`❌ Erro ao migrar pedido ${order.id}: ${orderErr.message}`);
            errors.push(`Pedido ${order.id}: ${orderErr.message}`);
          } else {
            ordersMigratedCount++;
            console.log(`✅ Pedido ${order.orderNumber || order.id} migrado.`);
          }
        }
      } else {
        console.log('ℹ️ data/orders.json existe mas está vazio. Nenhum pedido para migrar. A tabela orders permanece intacta.');
      }
    } catch (e: any) {
      console.warn('Aviso ao ler orders.json:', e?.message);
    }
  } else {
    console.log('ℹ️ data/orders.json não existe no momento. A tabela orders permanecerá vazia conforme requerido.');
  }

  // 6. Relatório Final de Migração
  console.log('\n====================================================');
  console.log('🎉 RESUMO DA MIGRAÇÃO PARA SUPABASE');
  console.log('====================================================');
  console.log(`📦 Produtos locais lidos:       ${localProducts.length}`);
  console.log(`✨ Novos produtos inseridos:    ${productsInsertedCount}`);
  console.log(`🔄 Produtos existentes atualizados: ${productsUpdatedCount}`);
  console.log(`🖼️ Imagens enviadas para Storage: ${imagesUploadedCount}`);
  console.log(`📋 Pedidos migrados:            ${ordersMigratedCount}`);
  console.log(`⚠️ Erros encontrados:          ${errors.length}`);
  if (errors.length > 0) {
    console.log('Lista de erros:');
    errors.forEach((e) => console.log(`  - ${e}`));
  }
  console.log('====================================================\n');
  console.log('🔒 SEGURANÇA: Nenhum arquivo local antigo foi apagado.');
  console.log('   - data/products.json mantido');
  console.log('   - public/products/ mantido');
  console.log('   - data/orders.json mantido');
  console.log('====================================================\n');

  return {
    success: errors.length === 0,
    productsRead: localProducts.length,
    productsInserted: productsInsertedCount,
    productsUpdated: productsUpdatedCount,
    imagesUploaded: imagesUploadedCount,
    ordersMigrated: ordersMigratedCount,
    errors,
  };
}

// Permitir execução direta via linha de comando: npx tsx scripts/migrate-to-supabase.ts
if (process.argv[1] && process.argv[1].includes('migrate-to-supabase')) {
  runMigration()
    .then((res) => {
      if (!res.success) {
        process.exit(1);
      }
      process.exit(0);
    })
    .catch((err) => {
      console.error('Fatal migration error:', err);
      process.exit(1);
    });
}
