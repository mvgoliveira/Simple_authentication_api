class AppError {
   public readonly message: string;
   public readonly statusCode: number;

   constructor(msg: string, statusCode: number = 400) {
      this.message = msg;
      this.statusCode = statusCode;
   }
}

export { AppError }