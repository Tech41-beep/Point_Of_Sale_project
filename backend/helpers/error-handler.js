
const errorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || err.status || 500;
    let message = err.message || "Server Error";
    if(err.name==="ValidationError"){
      const errors = Object.values(err.errors).map((el) => el.message);
      message = errors.join(",");
      statusCode = 400;
    }

    //duplicate key error
    if(err.code === 11000){
        const field = Object.keys(err.keyValue);
        message = `Duplicate value entered for ${field} field, please choose another value`;
        statusCode = 409;
    }
    
    if(process.env.NODE_ENV === "development"){
        res.status(statusCode).json({
            success: false,
            name: err.name,
            message,
            stack: err.stack
        })
    }else{
        res.status(statusCode).json({
            success: false,
            message
        })
    }

    console.error(err);
    }

    module.exports = errorHandler;
