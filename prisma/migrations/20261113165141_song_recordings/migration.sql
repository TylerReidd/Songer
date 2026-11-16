-- CreateTable
CREATE TABLE "song_recording" (
    "id" TEXT NOT NULL,
    "songId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "durationMs" INTEGER NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "data" BYTEA NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "song_recording_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "song_recording_songId_createdAt_idx" ON "song_recording"("songId", "createdAt" DESC);

-- AddForeignKey
ALTER TABLE "song_recording" ADD CONSTRAINT "song_recording_songId_fkey" FOREIGN KEY ("songId") REFERENCES "song"("id") ON DELETE CASCADE ON UPDATE CASCADE;
