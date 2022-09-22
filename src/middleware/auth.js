module.exports ={
  verifyToken: function (req,res,next){
    if(req.headers['authorization']){
      const token = req.headers['authorization'].split(" ")

      if (token[1] == 'qZMeN^%Kkx4#L2V5I4QvFlCFA'){
        next();
      }else{
        return res.status(401).end();
      }
    }else{
      return res.status(401).end();
    }   
  }
}