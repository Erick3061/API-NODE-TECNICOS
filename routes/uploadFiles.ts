import { Router } from 'express';
import { loadFile } from '../controller/uploadFilesController';

const router = Router();

router.post('/loadFile', [], loadFile);

export default router;