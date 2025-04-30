import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    // 1. 사용자 찾기
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return Response.json({ error: '존재하지 않는 이메일입니다.' }, { status: 404 });
    }

    // 2. 비밀번호 비교
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return Response.json({ error: '비밀번호가 틀렸습니다.' }, { status: 401 });
    }

    // 3. JWT 토큰 발급
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // 4. 응답
    return Response.json({ token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (error) {
    console.error(error);
    return Response.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
