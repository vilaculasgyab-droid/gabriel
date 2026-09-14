import { createClient } from '@supabase/supabase-js';

function cleanEnv(val: string | undefined): string {
  if (!val) return '';
  let s = val.trim();
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    s = s.slice(1, -1).trim();
  }
  return s;
}

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Pragma, Cache-Control');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Método ${req.method} não permitido.` });
  }

  // Parse body safely
  if (typeof req.body === 'string' && req.body.trim()) {
    try {
      req.body = JSON.parse(req.body);
    } catch {}
  }

  try {
    const { productId, dataUrl, fileName: originalFileName } = req.body || {};

    if (!dataUrl) {
      return res.status(400).json({ success: false, error: 'Nenhum dado de imagem (dataUrl) recebido.' });
    }

    const match = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!match) {
      return res.status(400).json({ success: false, error: 'Formato de DataURL inválido.' });
    }

    const mimeType = match[1];
    const base64Data = match[2];
    const fileBuffer = Buffer.from(base64Data, 'base64');

    const url = cleanEnv(process.env.SUPABASE_URL);
    const serviceRole = cleanEnv(process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_SERVICE_ROLE_KEY);

    if (!url || !serviceRole) {
      return res.status(500).json({
        success: false,
        error: 'SUPABASE_URL ou SUPABASE_SERVICE_ROLE não configurado no servidor.',
      });
    }

    const supabase = createClient(url, serviceRole, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const safeProdId = (productId || 'prod').replace(/[^a-zA-Z0-9_-]/g, '_');
    const extMatch = (originalFileName || '').match(/\.([a-zA-Z0-9]+)$/);
    const ext = extMatch ? extMatch[1].toLowerCase() : (mimeType.includes('png') ? 'png' : 'jpg');
    const storagePath = `prod_${safeProdId}_${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(storagePath, fileBuffer, {
        contentType: mimeType,
        upsert: true,
      });

    if (uploadError) {
      console.error('[Upload] Erro Supabase Storage:', uploadError.message);
      return res.status(500).json({
        success: false,
        error: `Erro ao enviar para o Supabase Storage: ${uploadError.message}`,
      });
    }

    const { data: publicData } = supabase.storage
      .from('product-images')
      .getPublicUrl(storagePath);

    return res.status(200).json({
      success: true,
      storage: 'supabase',
      url: `${publicData.publicUrl}?v=${Date.now()}`,
      fileName: storagePath,
      sizeBytes: fileBuffer.length,
      message: 'Imagem guardada no Supabase Storage com sucesso.',
    });
  } catch (err: any) {
    console.error('[Upload] Exceção ao gravar imagem:', err);
    return res.status(500).json({ success: false, error: err?.message || 'Falha ao processar imagem.' });
  }
}
