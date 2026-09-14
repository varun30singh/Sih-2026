import { Controller, Get, Param } from '../../common';
import { TokensService } from './tokens.service';

@Controller('tokens')
export class TokensController {
  constructor(private readonly tokensService: TokensService) {}

  @Get(':tokenNumber')
  getTokenDetails(@Param('tokenNumber') tokenNumber: string) {
    return this.tokensService.findByNumber(tokenNumber);
  }
}
