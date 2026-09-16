import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { WorkbookService } from './workbook.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateWorkbookDto } from './workbook.dto';

@Controller('workbooks')
@UseGuards(JwtAuthGuard)
export class WorkbookController {
  constructor(private readonly workbookService: WorkbookService) {}

  @Post()
  create(@Request() req: any, @Body() createWorkbookDto: CreateWorkbookDto) {
    return this.workbookService.create(req.user.id, createWorkbookDto);
  }

  @Get()
  findAll(@Request() req: any) {
    return this.workbookService.findAllByUser(req.user.id);
  }

  @Get(':id')
  findOne(@Request() req: any, @Param('id') id: string) {
    return this.workbookService.findOne(id, req.user.id);
  }
}
