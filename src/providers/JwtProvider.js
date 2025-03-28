import JWT from 'jsonwebtoken'
const generateToken = async (payload, secretSignature, tokenLife) => {
  try {
    return JWT.sign(payload, secretSignature, { algorithm: 'HS256', expiresIn: tokenLife })
  } catch (error) { throw new Error(error)}
}

//Hàm verify của thư viện này sẽ trả về payload nếu đúng
const verifyToken = async (token, secretSignature) => {
  try {
    return JWT.verify(token, secretSignature)
  } catch (error) { throw new Error(error)}
}

export const JwtProvider = {
  generateToken,
  verifyToken
}

export const ACCESS_TOKEN_SECRET_SIGNATURE = 'KBgJwUETt4HeVD05WaXXI9V3JnwCVP'
export const REFRESH_TOKEN_SECRET_SIGNATURE = 'fcCjhnpeopVn2Hg1jG75MUi62051yL'