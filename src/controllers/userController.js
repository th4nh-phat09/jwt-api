import { StatusCodes } from 'http-status-codes'
import ms from 'ms'
import { JwtProvider, ACCESS_TOKEN_SECRET_SIGNATURE, REFRESH_TOKEN_SECRET_SIGNATURE } from '~/providers/JwtProvider'

const MOCK_DATABASE = {
  USER: {
    ID: 'thanhphat-sample-id-12345678',
    EMAIL: 'thanhphat.official@gmail.com',
    PASSWORD: 'thanhphat@123'
  }
}

/**
 * 2 cái chữ ký bí mật quan trọng trong dự án. Dành cho JWT - Jsonwebtokens
 * Lưu ý phải lưu vào biến môi trường ENV trong thực tế cho bảo mật.
 * Ở đây mình làm Demo thôi nên mới đặt biến const và giá trị random ngẫu nhiên trong code nhé.
 */


const login = async (req, res) => {
  try {
    if (req.body.email !== MOCK_DATABASE.USER.EMAIL || req.body.password !== MOCK_DATABASE.USER.PASSWORD) {
      res.status(StatusCodes.FORBIDDEN).json({ message: 'Your email or password is incorrect!' })
      return
    }

    // Trường hợp nhập đúng thông tin tài khoản, tạo token và trả về cho phía Client
    //Tạo thông tin cho payload gửi về cho client
    const userInfo = {
      id: MOCK_DATABASE.USER.ID,
      email: MOCK_DATABASE.USER.EMAIL
    }
    //tạo access token gửi về cho client
    const accessToken = await JwtProvider.generateToken(userInfo, ACCESS_TOKEN_SECRET_SIGNATURE, '1h')
    //tạo refresh token gửi về cho client
    const refreshToken = await JwtProvider.generateToken(userInfo, REFRESH_TOKEN_SECRET_SIGNATURE, '14 days')
    //set lại cookie cho client
    res.cookie(
      'accessToken',
      accessToken.toString(),
      {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: ms('14 days')
      }
    )
    res.cookie(
      'refreshToken',
      refreshToken.toString(),
      {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: ms('14 days')
      }
    )

    // //trả về kqua cho client
    res.status(StatusCodes.OK).json({
      ...userInfo,
      accessToken,
      refreshToken
    })
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error)
  }
}

const logout = async (req, res) => {
  try {
    //Nếu token lưu ở cookie thì khi gọi lên api này thì phải clear cookie này lại cho client
    //để client set lại cookie
    res.clearCookie('accessToken')
    res.clearCookie('refreshToken')
    res.status(StatusCodes.OK).json({ message: 'Logout API success!' })
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error)
  }
}

const refreshToken = async (req, res) => {
  try {
    //cách 1 lấy token từ req nếu lưu bằng cookie
    //const refreshToken = req.cookies?.refreshToken
    // cách 2 lấy token ra nếu lưu từ localStorage
    //lưu ý với refreshToken thì FE sẽ gửi từ body lên cho BE
    const refreshToken = req.body?.refreshToken
    const verifyToken = await JwtProvider.verifyToken(refreshToken, REFRESH_TOKEN_SECRET_SIGNATURE)
    //tạo lại payload để tạo accessToken
    const userInfo = {
      id: verifyToken.id,
      email: verifyToken.email
    }
    //tạo access token gửi về cho client
    const accessToken = await JwtProvider.generateToken(userInfo, ACCESS_TOKEN_SECRET_SIGNATURE, '5')
    //set lại cookie cho client
    res.cookie(
      'accessToken',
      accessToken,
      {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: ms('14 days')
      }
    )
    res.status(StatusCodes.OK).json({
      message: ' Access Token genarate again',
      accessToken
    })
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Please Login again' })
  }
}

export const userController = {
  login,
  logout,
  refreshToken
}
