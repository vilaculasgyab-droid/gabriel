/**
 * Função utilitária universal para extrair mensagens de erro em formato de texto seguro.
 * Garante que objetos (como erros do Supabase/PostgREST { code, message, details, hint },
 * erros de fetch, ou exceções de runtime) NUNCA sejam passados diretamente como React children (React Error #31).
 */
export function getSafeErrorMessage(error: unknown, fallback: string = 'Ocorreu um erro inesperado.'): string {
  if (error === null || error === undefined) {
    return fallback;
  }

  // Se já for string pura
  if (typeof error === 'string') {
    const trimmed = error.trim();
    return trimmed.length > 0 ? trimmed : fallback;
  }

  // Se for instância padrão de Error
  if (error instanceof Error) {
    if (typeof error.message === 'string' && error.message.trim().length > 0) {
      return error.message.trim();
    }
    return String(error) || fallback;
  }

  // Se for objeto (ex: PostgREST error, Supabase error { code, message, details, hint })
  if (typeof error === 'object') {
    const obj = error as Record<string, unknown>;

    // 1. Mensagem direta
    if (typeof obj.message === 'string' && obj.message.trim().length > 0) {
      return obj.message.trim();
    }

    // 2. Propriedade error como string
    if (typeof obj.error === 'string' && obj.error.trim().length > 0) {
      return obj.error.trim();
    }

    // 3. Propriedade error aninhada como objeto
    if (obj.error && typeof obj.error === 'object') {
      const nested = obj.error as Record<string, unknown>;
      if (typeof nested.message === 'string' && nested.message.trim().length > 0) {
        return nested.message.trim();
      }
      if (typeof nested.details === 'string' && nested.details.trim().length > 0) {
        return nested.details.trim();
      }
    }

    // 4. Detalhes ou sugestões do Supabase
    if (typeof obj.details === 'string' && obj.details.trim().length > 0) {
      return obj.details.trim();
    }

    if (typeof obj.hint === 'string' && obj.hint.trim().length > 0) {
      return obj.hint.trim();
    }

    // 5. Se houver código de erro
    if (typeof obj.code === 'string' && obj.code.trim().length > 0) {
      return `Código de erro: ${obj.code}`;
    }

    // 6. Serialização JSON segura como fallback
    try {
      const json = JSON.stringify(obj);
      if (json && json !== '{}') {
        return json;
      }
    } catch {
      // ignore
    }
  }

  try {
    return String(error);
  } catch {
    return fallback;
  }
}
