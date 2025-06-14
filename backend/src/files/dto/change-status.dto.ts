import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class ChangeFileStatusDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({ description: 'The ID of the file to change status' })
    statusId: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ description: 'The comment for the status change ' })
    comment?: string;
}