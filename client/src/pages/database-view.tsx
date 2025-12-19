import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

export default function DatabaseViewPage() {
  const [data, setData] = useState<any>(null);
  const [supabaseData, setSupabaseData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/public/database-view")
      .then(res => res.json())
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    fetch("/api/public/supabase-view")
      .then(res => res.json())
      .then(data => setSupabaseData(data))
      .catch(() => {});
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>Failed to load database view</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const stats = data.mongodb?.statistics || {};
  const samples = data.mongodb?.sampleData || {};

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Database View</h1>
          <p className="text-gray-600">Read-only view of database statistics</p>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="mongodb">MongoDB</TabsTrigger>
            <TabsTrigger value="supabase">Supabase</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.users?.total || 0}</div>
                  <p className="text-sm text-gray-500 mt-2">
                    {stats.users?.members || 0} members
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Products</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.products?.total || 0}</div>
                  <p className="text-sm text-gray-500 mt-2">
                    {stats.products?.active || 0} active
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.orders?.total || 0}</div>
                  <p className="text-sm text-gray-500 mt-2">
                    {stats.orders?.delivered || 0} delivered
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Other</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1 text-sm">
                    <div>Carts: {stats.carts?.total || 0}</div>
                    <div>Coupons: {stats.coupons?.total || 0}</div>
                    <div>Blog: {stats.blogPosts?.total || 0}</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>User Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total:</span>
                    <strong>{stats.users?.total || 0}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Members:</span>
                    <strong>{stats.users?.members || 0}</strong>
                  </div>
                </div>
              </CardContent>
            </Card>

            {samples.recentUsers && (
              <Card>
                <CardHeader>
                  <CardTitle>Recent Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {samples.recentUsers.slice(0, 10).map((user: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center p-2 border rounded">
                        <div>
                          <div className="font-medium">{user.username}</div>
                          <div className="text-sm text-gray-500">{user.email || "-"}</div>
                        </div>
                        {user.membership?.tier && (
                          <Badge variant="secondary">{user.membership.tier}</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="products" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Product Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total:</span>
                    <strong>{stats.products?.total || 0}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Active:</span>
                    <strong>{stats.products?.active || 0}</strong>
                  </div>
                </div>
              </CardContent>
            </Card>

            {samples.recentProducts && (
              <Card>
                <CardHeader>
                  <CardTitle>Recent Products</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {samples.recentProducts.slice(0, 10).map((product: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center p-2 border rounded">
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-gray-500">{product.category}</div>
                        </div>
                        <div className="font-bold">${product.price}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="orders" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Order Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total:</span>
                    <strong>{stats.orders?.total || 0}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Pending:</span>
                    <strong>{stats.orders?.pending || 0}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivered:</span>
                    <strong>{stats.orders?.delivered || 0}</strong>
                  </div>
                </div>
              </CardContent>
            </Card>

            {samples.recentOrders && (
              <Card>
                <CardHeader>
                  <CardTitle>Recent Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {samples.recentOrders.slice(0, 10).map((order: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center p-2 border rounded">
                        <div>
                          <div className="font-medium">Order #{order.orderNumber}</div>
                          <div className="text-sm text-gray-500">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">${order.totalAmount}</div>
                          <Badge variant="secondary" className="mt-1">{order.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="mongodb" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>MongoDB Collections</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Users - {stats.users?.total || 0}</li>
                  <li>Products - {stats.products?.total || 0}</li>
                  <li>Orders - {stats.orders?.total || 0}</li>
                  <li>Carts - {stats.carts?.total || 0}</li>
                  <li>Coupons - {stats.coupons?.total || 0}</li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="supabase" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Supabase</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm">
                  {supabaseData?.supabase?.configured ? (
                    <p>Supabase is configured for authentication</p>
                  ) : (
                    <p>Supabase info not available</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
