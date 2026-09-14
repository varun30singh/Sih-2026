/**
 * End-to-End Smoke Test for MandiSetu NestJS Services
 */

import { AppModule } from '../src/app.module';

describe('MandiSetu Core Module Smoke Test', () => {
  it('should define AppModule', () => {
    expect(AppModule).toBeDefined();
  });
});
