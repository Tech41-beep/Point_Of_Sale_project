
const errorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let error = err;
    if(err.name==="ValidationError"){
      const errors = Object.values(err.errors).map((el) => el.message);
      error = new Error(errors.join(","));
      statusCode = 400;
      
    }
    //duplicate key error
    if(err.code === 11000){
        const field = Object.keys(err.keyValue);
      error = new Error(`Duplicate value entered for ${field} field, please choose another value`);
      statusCode = 409;
    }
    
    if(process.env.NODE_ENV === "development"){
        res.status(statusCode).json({
            success: false,
            name: err.name,
            message: error.message,
            error: error.message,
            stack: err.stack
        })
    }else{
        res.status(statusCode).json({
            success: false,
            message: error.message || "Server Error",
            error: error.message || "Server Error"
        })
    }
    
    console.log(error);
    }

    module.exports = errorHandler;
