import jwt from "jsonwebtoken"

const adminAuth = async(req,res,callback) =>{
    try {
        const {token} = req.headers;
        if(!token){
            return res.json({success:false, message:"Not authorized, Login Again"})
        }
        // Decode the token using the secret key stored in the environment variable and verify its authenticity
        //Synchronously verify given token using a secret or a public key to get a decoded token token - JWT string to verify secretOrPublicKey - Either the secret for HMAC algorithms, or the PEM encoded public key for RSA and ECDSA. [options] - Options for the verification returns - The decoded token.
        const token_decode = jwt.verify(token,process.env.JWT_SECRET);
        if(token_decode !== process.env.ADMIN_EMAIL + process.env.ADMIN_PASSWORD ){
            return res.json({success:false, message:"Not authorized, Login Again"})
        }
        callback();
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
}
export default adminAuth