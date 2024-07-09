import { Controller, Get, Post, Body, UseGuards, Req, Headers, Patch, ParseUUIDPipe, Param } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto } from './dto';
import { AuthGuard } from '@nestjs/passport';
import { User } from './entities/user.entity';
import { Auth, GetUser,RawHeaders } from './decorators';
import { IncomingHttpHeaders } from 'http';
import { UserRoleGuard } from './guards/user-role/user-role.guard';
import { RoleProtected } from './decorators/role-protected.decorator';
import { ValidRoles } from './interfaces';
import { UpdateUserDto } from './dto/upadte-user.dto';

//import { UpdateAuthDto } from './dto/update-auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  create(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

 
  @Post('login')
  loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Post(':id/:keyword')
  validateUser(@Param('id') id:string, @Param('keyword') keyword: string) {
    return this.authService.validateUser({ keyword}, id);
  }

  @Get(':term')
  findOne(@Param('term') id: string){
    return this.authService.findOnePlain(id);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.authService.update(id, updateUserDto);
  }

  @Get('check-status')
  @Auth()
  checkAuthStatus(@GetUser() user: User
){
    return this.authService.checkAuthStatus(user);
  }

  @Get('private')
  @UseGuards(AuthGuard())
  testingPrivateRoute(
    @Req() request: Express.Request,
    @GetUser() user: User,
    @GetUser('email') userEmail: string,
    @RawHeaders() rawHeaders: string[],
    @Headers() headers: IncomingHttpHeaders,
  ){

    return {
      ok: true,
      message: 'hola mundo privado',
      user,
      userEmail,
      rawHeaders,
      headers
    }
  }
//@SetMetadata('roles', ['admin','super-user'])

  @Get('private2')
  @RoleProtected(ValidRoles.superUser, ValidRoles.admin, ValidRoles.user)
  @UseGuards( AuthGuard(), UserRoleGuard )
  privateRoute2(
  @GetUser() user: User
  ){
    return {
      ok: true,
      user,
    }
  }

  @Get('private3')
  @Auth()
  privateRoute3(
  @GetUser() user: User
  ){
    return {
      ok: true,
      user,
    }
  }

}
