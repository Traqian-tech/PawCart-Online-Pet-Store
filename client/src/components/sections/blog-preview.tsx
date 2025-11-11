import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { Calendar, User, ArrowRight, BookOpen, BookText } from "lucide-react";

interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  image?: string;
  author: string;
  publishedAt?: Date;
  category?: string;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export default function BlogPreview() {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopBlogs = async () => {
      try {
        const response = await fetch("/api/blog/published");
        const blogs = await response.json();
        // Get top 3 blogs
        setBlogPosts(blogs.slice(0, 3));
      } catch (error) {
        console.error("Error fetching blog posts:", error);
        setBlogPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTopBlogs();
  }, []);

  if (loading) {
    return (
      <section className="relative py-12 md:py-16 bg-gradient-to-b from-gray-50 via-white to-gray-50 overflow-hidden rounded-3xl">
        <div className="pointer-events-none absolute inset-0 opacity-40">
          <div className="absolute -top-16 -left-20 w-56 h-56 md:w-80 md:h-80 rounded-full bg-[#ffde59]/25 blur-3xl" />
          <div className="absolute -bottom-16 -right-20 w-56 h-56 md:w-80 md:h-80 rounded-full bg-[#26732d]/10 blur-3xl" />
        </div>
        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-6 md:mb-10">
            <div className="inline-flex items-center gap-2 md:gap-3 mb-3">
              <BookOpen size={20} className="text-[#26732d] md:w-8 md:h-8" />
              <h2 className="text-xl md:text-4xl font-extrabold tracking-tight text-[#1f2d1f]">
                LATEST PET CARE TIPS
              </h2>
            </div>
            <p className="text-xs md:text-base text-gray-600">
              Stay informed with expert advice and insights to keep your pets healthy and happy.
            </p>
            <div className="mt-4 flex justify-center">
              <span className="inline-block h-1 w-20 md:w-28 rounded-full bg-gradient-to-r from-[#ffde59] to-[#26732d]" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
            {[...Array(3)].map((_, idx) => (
              <div key={idx} className={`rounded-2xl bg-white p-4 md:p-6 shadow-sm ring-1 ring-gray-100 animate-pulse ${idx === 2 ? 'hidden md:block' : ''}`}>
                <div className="w-full h-36 sm:h-40 md:h-48 bg-gray-200 rounded-xl mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6 mb-4"></div>
                <div className="flex gap-2">
                  <div className="h-3 bg-gray-200 rounded w-24"></div>
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (blogPosts.length === 0) {
    return (
      <section className="relative py-12 md:py-16 bg-gradient-to-b from-gray-50 via-white to-gray-50 overflow-hidden rounded-3xl">
        <div className="pointer-events-none absolute inset-0 opacity-40">
          <div className="absolute -top-16 -left-20 w-56 h-56 md:w-80 md:h-80 rounded-full bg-[#ffde59]/25 blur-3xl" />
          <div className="absolute -bottom-16 -right-20 w-56 h-56 md:w-80 md:h-80 rounded-full bg-[#26732d]/10 blur-3xl" />
        </div>
        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-6 md:mb-10">
            <div className="inline-flex items-center gap-2 md:gap-3 mb-3">
              <BookOpen size={20} className="text-[#26732d] md:w-8 md:h-8" />
              <h2 className="text-xl md:text-4xl font-extrabold tracking-tight text-[#1f2d1f]">
                LATEST PET CARE TIPS
              </h2>
            </div>
            <p className="text-xs md:text-base text-gray-600">
              No blog posts available at the moment.
            </p>
            <div className="mt-4 flex justify-center">
              <span className="inline-block h-1 w-20 md:w-28 rounded-full bg-gradient-to-r from-[#ffde59] to-[#26732d]" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative py-12 md:py-16 bg-gradient-to-b from-gray-50 via-white to-gray-50 overflow-hidden rounded-3xl">
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div className="absolute -top-16 -left-20 w-56 h-56 md:w-80 md:h-80 rounded-full bg-[#ffde59]/25 blur-3xl" />
        <div className="absolute -bottom-16 -right-20 w-56 h-56 md:w-80 md:h-80 rounded-full bg-[#26732d]/10 blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative">
        <div className="text-center mb-6 sm:mb-10">
          <div className="flex items-center justify-center gap-2 md:gap-3 mb-3">
            <BookText size={20} className="text-[#26732d] md:w-8 md:h-8" />
            <h2 className="text-xl md:text-4xl font-extrabold tracking-tight text-[#1f2d1f]">
              LATEST PET CARE TIPS
            </h2>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto text-xs sm:text-base px-4">
            Stay informed with expert advice and insights to keep your pets healthy and happy.
          </p>
          <div className="mt-4 flex justify-center">
            <span className="inline-block h-1 w-20 md:w-28 rounded-full bg-gradient-to-r from-[#ffde59] to-[#26732d]" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 mb-8">
          {blogPosts.map((post, index) => (
            <Card
              key={post._id}
              className={`group hover:shadow-xl transition-all duration-300 overflow-hidden rounded-2xl ring-1 ring-gray-100 ${
                index === 2 ? 'hidden md:block' : ''
              }`}
            >
              <div className="relative overflow-hidden">
                <img
                  src={post.image || "/api/placeholder/400/200"}
                  alt={post.title}
                  className="w-full h-36 sm:h-40 md:h-48 object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent opacity-80"></div>
                <Badge className="absolute top-2 left-2 sm:top-4 sm:left-4 bg-indigo-600 text-white shadow text-[10px] sm:text-xs">
                  {post.category || "General"}
                </Badge>
              </div>

              <CardContent className="p-4 sm:p-5 md:p-6">
                <h3 className="text-sm sm:text-base md:text-xl font-extrabold mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors leading-tight tracking-tight">
                  {post.title}
                </h3>
                <p className="text-gray-600 mb-3 sm:mb-4 line-clamp-2 text-xs sm:text-sm md:text-base">
                  {post.excerpt || post.content.substring(0, 100) + "..."}
                </p>

                <div className="flex flex-col gap-2 mb-3 sm:mb-4 text-xs sm:text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="truncate">{post.author}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="text-xs">
                      {new Date(
                        post.publishedAt || post.createdAt,
                      ).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "2-digit"
                      })}
                    </span>
                  </div>
                </div>

                <Link href={`/blog/${post.slug}`}>
                  <Button
                    variant="outline"
                    className="w-full group text-xs sm:text-sm py-2 h-auto rounded-xl"
                    size="sm"
                  >
                    Read More
                    <ArrowRight className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center px-4">
          <Link href="/blog">
            <Button size="lg" className="group text-sm sm:text-base bg-[#26732d] hover:bg-[#205e25] text-white rounded-xl px-5 md:px-6 py-5 md:py-6 shadow-md hover:shadow-lg">
              <BookOpen className="mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              View All Articles
              <ArrowRight className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}