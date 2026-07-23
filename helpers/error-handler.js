
const errorHandler = (err, req, res, next) => {
    const statusCode  = 500;
    let error = new Error("Server Error");
    if(err.name==="ValidationError"){
      const errors = Object.values(err.errors).map((el) => el.message);
      error = new Error(errors.join(","));
      statusCode = 400;
      
    }
    //duplicate key error
    if(err.code == 1100){
        const field = Object.keys(err.keyValue);
        error = new Error(`Duplicate value entered for ${field} field, please choose another value`);
        statusCode = 409;
    }
    
    if(process.env.NODE_ENV === "development"){
        res.status(statusCode).json({
            success: false,
            name: err.name,
            error: error.message,
            stack: err.stack
        })
    }else{
        res.status(statusCode).json({
            success: false,
            error: error.message || "Server Error"
        })
    }
    
    console.log(error);
    }

    module.exports = errorHandler;