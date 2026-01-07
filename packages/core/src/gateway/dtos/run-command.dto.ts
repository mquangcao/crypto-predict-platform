import { PickType } from "@nestjs/swagger";

import { RunOperationDto } from "./run-operation.dto";

export class RunCommandDto extends PickType(RunOperationDto, [
  "operationId",
  "payload",
] as const) {}
