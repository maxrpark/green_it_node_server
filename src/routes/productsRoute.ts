import express from "express";
import {
  getAllProducts,
  featuredProducts,
  createProduct,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
  deletePreviousImage,
  searchProduct,
} from "../controllers/productsControllers";
import {
  authenticateUser,
  authorizePermissions,
} from "../middleware/authentication";

const router = express.Router();

router.route("/featured").get(featuredProducts);

router
  .route("/")
  .get(getAllProducts)
  .post([authenticateUser, authorizePermissions("admin")], createProduct);
router.route("/search/").get(searchProduct);
router
  .route("/:id")
  .get(getSingleProduct)
  .patch([authenticateUser, authorizePermissions("admin")], updateProduct)
  .delete([authenticateUser, authorizePermissions("admin")], deleteProduct);
router
  .route("/upload-img")
  .post([authenticateUser, authorizePermissions("admin")], uploadProductImage);
router
  .route("/delete-image/:id")
  .delete(
    [authenticateUser, authorizePermissions("admin")],
    deletePreviousImage
  );

// reviews
// uploadImg

export default router;
