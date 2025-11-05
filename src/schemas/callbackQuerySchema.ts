import { z } from 'zod';

// ✅ 구글이 보내주는 건 code 하나뿐 (sub/email 등은 서버가 검증해서 얻는다)
export const callbackQuerySchema = z.object({
  code: z.string().min(1),
  state: z.string().optional(),
});

export type CallbackQueryType = z.infer<typeof callbackQuerySchema>;
