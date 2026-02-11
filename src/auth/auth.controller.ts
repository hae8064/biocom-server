import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { AuthTokenResponseDto } from './dto/response/auth-token-response.dto';
import { LoginDto } from './dto/request/login.dto';
import { RegisterDto } from './dto/request/register.dto';
import { RegisterResponseDto } from './dto/response/register-response.dto';

@ApiTags('인증 (Auth)')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({
    summary: '회원가입',
    description: '새 계정을 생성하고 JWT 토큰을 반환합니다.',
  })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 201,
    description: '회원가입 성공',
    type: RegisterResponseDto,
  })
  @ApiResponse({ status: 409, description: '이미 사용 중인 이메일' })
  @ApiResponse({ status: 400, description: '유효성 검증 실패' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @ApiOperation({
    summary: '로그인',
    description: '이메일과 비밀번호로 로그인하여 JWT 토큰을 발급합니다.',
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 201,
    description: '로그인 성공',
    type: AuthTokenResponseDto,
  })
  @ApiResponse({ status: 401, description: '이메일 또는 비밀번호 불일치' })
  @ApiResponse({ status: 400, description: '유효성 검증 실패' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}
