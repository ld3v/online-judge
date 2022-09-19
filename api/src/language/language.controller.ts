import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { Role } from 'src/account/account.enum';
import RequestWithAccount from 'src/auth/dto/reqWithAccount.interface';
import JwtAuthGuard from 'src/auth/gaurd/jwtAuth.gaurd';
import RoleGuard from 'src/auth/gaurd/roles.gaurd';
import { TParamId } from 'utils/types';
import CreateDto from './dto/create.dto';
import { LanguageService } from './language.service';

@Controller('language')
export class LanguageController {
  constructor (
    private readonly langService: LanguageService,
  ) {}

  @Get('/')
  @UseGuards(JwtAuthGuard)
  async getAll() {
    try {
      return await this.langService.getAll();
    } catch (err) {
      throw err;
    }
  }

  @Post('/')
  @UseGuards(JwtAuthGuard)
  @UseGuards(RoleGuard(Role.Admin))
  async create(
    @Body() data: CreateDto,
  ) {
    try {
      return await this.langService.create(data);
    } catch (err) {
      throw err;
    }
  }

  @Patch('/:id')
  @UseGuards(JwtAuthGuard)
  @UseGuards(RoleGuard(Role.Admin))
  async update(
    @Param() { id }: TParamId,
    @Body() data: CreateDto,
  ) {
    try {
      const lang = await this.langService.getById(id);
      return await this.langService.update(lang, data);
    } catch (err) {
      throw err;
    }
  }

  @Delete('/:id')
  @UseGuards(JwtAuthGuard)
  @UseGuards(RoleGuard(Role.Admin))
  async delete(
    @Param() { id }: TParamId,
  ) {
    try {
      const lang = await this.langService.getById(id);
      return await this.langService.delete(lang);
    } catch (err) {
      throw err;
    }
  }
}
