# Node.js 공식 이미지
FROM node:20

# 작업 디렉토리 설정
WORKDIR /app

# package.json, package-lock.json 복사
COPY package*.json ./

# 라이브러리 설치
RUN npm install

# 전체 소스 복사
COPY . .

# Prisma Client 생성 (이제 schema.prisma가 복사되어 있음)
RUN npx prisma generate

# 포트 오픈
EXPOSE 3000

# 개발 서버 실행
CMD ["npm", "run", "dev"]
