-- CreateEnum
CREATE TYPE "SongStatus" AS ENUM ('IDEA', 'IN_PROGRESS', 'COMPLETE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "SectionType" AS ENUM ('INTRO', 'VERSE', 'PRE_CHORUS', 'CHORUS', 'BRIDGE', 'INSTRUMENTAL', 'OUTRO', 'CUSTOM');

-- CreateEnum
CREATE TYPE "VersionKind" AS ENUM ('MANUAL', 'RECOVERY');

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lyricFont" TEXT DEFAULT 'serif',
    "isDemo" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "song" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'Untitled',
    "status" "SongStatus" NOT NULL DEFAULT 'IDEA',
    "key" TEXT,
    "bpm" INTEGER,
    "timeSignature" TEXT,
    "capo" INTEGER,
    "tuning" TEXT,
    "notes" TEXT NOT NULL DEFAULT '',
    "isFavorite" BOOLEAN NOT NULL DEFAULT false,
    "revision" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "song_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "song_section" (
    "id" TEXT NOT NULL,
    "songId" TEXT NOT NULL,
    "type" "SectionType" NOT NULL,
    "customLabel" TEXT,
    "content" TEXT NOT NULL DEFAULT '',
    "position" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "song_section_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "song_version" (
    "id" TEXT NOT NULL,
    "songId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "kind" "VersionKind" NOT NULL DEFAULT 'MANUAL',
    "snapshot" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "song_version_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "idea" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "title" TEXT,
    "content" TEXT NOT NULL,
    "songId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "idea_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_isDemo_createdAt_idx" ON "user"("isDemo", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE INDEX "session_userId_idx" ON "session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");

-- CreateIndex
CREATE INDEX "account_userId_idx" ON "account"("userId");

-- CreateIndex
CREATE INDEX "verification_identifier_idx" ON "verification"("identifier");

-- CreateIndex
CREATE INDEX "song_ownerId_updatedAt_idx" ON "song"("ownerId", "updatedAt" DESC);

-- CreateIndex
CREATE INDEX "song_ownerId_status_idx" ON "song"("ownerId", "status");

-- CreateIndex
CREATE INDEX "song_ownerId_isFavorite_idx" ON "song"("ownerId", "isFavorite");

-- CreateIndex
CREATE INDEX "song_section_songId_position_idx" ON "song_section"("songId", "position");

-- CreateIndex
CREATE INDEX "song_version_songId_createdAt_idx" ON "song_version"("songId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "idea_ownerId_updatedAt_idx" ON "idea"("ownerId", "updatedAt" DESC);

-- CreateIndex
CREATE INDEX "idea_songId_idx" ON "idea"("songId");

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "song" ADD CONSTRAINT "song_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "song_section" ADD CONSTRAINT "song_section_songId_fkey" FOREIGN KEY ("songId") REFERENCES "song"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "song_version" ADD CONSTRAINT "song_version_songId_fkey" FOREIGN KEY ("songId") REFERENCES "song"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "idea" ADD CONSTRAINT "idea_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "idea" ADD CONSTRAINT "idea_songId_fkey" FOREIGN KEY ("songId") REFERENCES "song"("id") ON DELETE SET NULL ON UPDATE CASCADE;
