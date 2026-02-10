import { MigrationInterface, QueryRunner } from "typeorm";

export class ConvertSymbolsToArray1739182800000 implements MigrationInterface {
    name = 'ConvertSymbolsToArray1739182800000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Convert simple-array (comma-separated) to PostgreSQL text array
        await queryRunner.query(`
            -- Create temporary column
            ALTER TABLE "news_article" ADD COLUMN "symbols_temp" text[];
            
            -- Convert comma-separated values to array
            UPDATE "news_article" 
            SET "symbols_temp" = string_to_array("symbols", ',')
            WHERE "symbols" IS NOT NULL AND "symbols" != '';
            
            -- Drop old column
            ALTER TABLE "news_article" DROP COLUMN "symbols";
            
            -- Rename temp column
            ALTER TABLE "news_article" RENAME COLUMN "symbols_temp" TO "symbols";
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revert to simple-array format
        await queryRunner.query(`
            -- Create temporary column
            ALTER TABLE "news_article" ADD COLUMN "symbols_temp" text;
            
            -- Convert array to comma-separated values
            UPDATE "news_article" 
            SET "symbols_temp" = array_to_string("symbols", ',')
            WHERE "symbols" IS NOT NULL;
            
            -- Drop array column
            ALTER TABLE "news_article" DROP COLUMN "symbols";
            
            -- Rename temp column
            ALTER TABLE "news_article" RENAME COLUMN "symbols_temp" TO "symbols";
        `);
    }
}
