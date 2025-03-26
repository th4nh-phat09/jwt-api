import { StatusCodes } from 'http-status-codes'
import { JwtProvider, ACCESS_TOKEN_SECRET_SIGNATURE } from '~/providers/JwtProvider'

const isAuthorized = async (req, res, next) => {

  //Cách 1 lấy token từ cookie từ req mà client gửi lên
  const accessTokenFromCookie = req.cookies?.accessToken
  if ( !accessTokenFromCookie ) {
    res.status(StatusCodes.UNAUTHORIZED).json({ message: 'UNAUTHORIZED!' })
    return
  }

  //cách 2 lấy token từ header từ req mà client lấy ra ở localStorage gửi lên
  //lưu ý với trường hợp này thì token sẽ có dạng Bearer + token
  const accessTokenFromHeader = req.headers?.authorization.substring(('Bearer ').length)
  if ( !accessTokenFromHeader ) {
    res.status(StatusCodes.UNAUTHORIZED).json({ message: 'UNAUTHORIZED!' })
    return
  }

  //Sau khi lấy được token từ client gửi lên thì ta phải ktra token đó lại
  //sẽ có ba trường hợp xảy ra với token
  //TH1:token hết hạn
  //Th2:token không đúng
  //Th3:token đúng
  try {
    //cách 1 verify token từ cookie
    const verifyAccessTokenCookie = await JwtProvider.verifyToken(accessTokenFromCookie, ACCESS_TOKEN_SECRET_SIGNATURE)

    //cách 2 verify token từ header
    //const verifyAccessTokenHeader = await JwtProvider.verifyToken(accessTokenFromHeader, ACCESS_TOKEN_SECRET_SIGNATURE)

    //gắn payload vào req để khi đi đến các tầng sau như Controller có thể sử dụng
    //đối với cookie
    req.jwtDecoded = verifyAccessTokenCookie
    //đối với header
    //req.jwtDecoded = verifyAccessTokenHeader

    //Khi gắn xong vào req thì đẩy nó qua tầng tiếp theo là COntroller để xử lý
    next()
  } catch (error) {
    // kiểm tra nếu nó rơi vào trường hợp token hết hạn thì trả về lỗi GONE status 410 để client gửi
    //lại refresh token tạo access token mới
    //theo hàm verify của thư viện jsonwebtoken thì trong message của error sẽ chứa message: 'jwt expired'
    if ( error?.message?.includes('jwt expired') ) {
      res.status(StatusCodes.GONE).json({ message: 'token expired!' })
      return
    }
    //Đương nhiên cuối cùng sẽ rơi vào trường hợp token so sánh ko đúng
    res.status(StatusCodes.UNAUTHORIZED).json({ message: 'UNAUTHORIZED!' })
  }
}

export const authMiddlewares = {
  isAuthorized
}