import {Router} from "express";
import {AuthenticatedUser, Login, Logout, Register, UpdateInfo, UpdatePassword} from "./controller/auth.controller.ts";
import {AuthMiddleware} from "./middleware/auth.middleware.ts";
import {Ambassadors, Rankings} from "./controller/user.controller.ts";
import {
    CreateProduct,
    DeleteProduct,
    GetProduct,
    Products, ProductsBackend,
    ProductsFrontend,
    UpdateProduct
} from "./controller/product.controller.ts";
import {CreateLink, GetLink, Links, Stats} from "./controller/link.controller.ts";
import {ConfirmOrder, CreateOrder, Orders} from "./controller/order.controller.ts";

export const routes = (router: Router) => {
    // Admin routes
    router.post('/api/admin/register', Register);
    router.post('/api/admin/login', Login);
    router.post('/api/admin/logout', AuthMiddleware, Logout);
    router.get('/api/admin/user', AuthMiddleware, AuthenticatedUser);
    router.put('/api/admin/users/info', AuthMiddleware, UpdateInfo);
    router.put('/api/admin/users/password', AuthMiddleware, UpdatePassword);

    router.get('/api/admin/ambassadors', AuthMiddleware, Ambassadors);

    router.get('/api/admin/products', AuthMiddleware, Products);
    router.post('/api/admin/products', AuthMiddleware, CreateProduct);
    router.get('/api/admin/product/:id', AuthMiddleware, GetProduct);
    router.put('/api/admin/product/:id', AuthMiddleware, UpdateProduct);
    router.delete('/api/admin/product/:id', AuthMiddleware, DeleteProduct);

    router.get('/api/admin/users/:id/links', AuthMiddleware, Links);
    router.get('/api/admin/orders', AuthMiddleware, Orders);

    // Ambassador routes
    router.post('/api/ambassador/register', Register);
    router.post('/api/ambassador/login', Login);
    router.post('/api/ambassador/logout', AuthMiddleware, Logout);
    router.get('/api/ambassador/user', AuthMiddleware, AuthenticatedUser);
    router.put('/api/ambassador/users/info', AuthMiddleware, UpdateInfo);
    router.put('/api/ambassador/users/password', AuthMiddleware, UpdatePassword);
    router.get('/api/ambassador/products/frontend', ProductsFrontend);
    router.get('/api/ambassador/products/backend', ProductsBackend);
    router.post('/api/ambassador/links', AuthMiddleware, CreateLink);
    router.get('/api/ambassador/stats', AuthMiddleware, Stats);
    router.get('/api/ambassador/rankings', AuthMiddleware, Rankings);

    // Checkout routes
    router.get('/api/checkout/links/:code', GetLink);
    router.post('/api/checkout/orders', CreateOrder);
    router.post('/api/checkout/orders/confirm', ConfirmOrder);

}