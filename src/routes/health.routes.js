import { Router } from 'express';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.route('/').get(
  asyncHandler(async (req, res) => {
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          uptime: process.uptime(),
          status: 'OK',
          timestamp: Date.now(),
        },
        'Server is healthy and running'
      )
    );
  })
);

export default router;
