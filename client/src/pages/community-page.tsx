import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Community, Post } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPostSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";
import { Loader2, MessageSquarePlus, Users } from "lucide-react";

// User avatar images for post authors
const USER_AVATARS = [
  "https://images.unsplash.com/photo-1630910561339-4e22c7150093",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80",
  "https://images.unsplash.com/photo-1646617747609-45b466ace9a6",
  "https://images.unsplash.com/photo-1628891435222-065925dcb365",
];

export default function CommunityPage() {
  const [, params] = useRoute("/c/:id");
  const communityId = parseInt(params?.id || "0");
  const { user } = useAuth();

  const { data: community, isLoading: loadingCommunity } = useQuery<Community>({
    queryKey: ["/api/communities", communityId],
  });

  const { data: posts, isLoading: loadingPosts } = useQuery<Post[]>({
    queryKey: ["/api/communities", communityId, "posts"],
  });

  const joinMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", `/api/communities/${communityId}/join`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/communities", communityId] });
    },
  });

  const form = useForm({
    resolver: zodResolver(insertPostSchema),
    defaultValues: {
      title: "",
      content: "",
      communityId,
    },
  });

  const onSubmit = async (data: any) => {
    try {
      await apiRequest("POST", `/api/communities/${communityId}/posts`, data);
      queryClient.invalidateQueries({ queryKey: ["/api/communities", communityId, "posts"] });
      form.reset();
    } catch (error) {
      console.error("Failed to create post:", error);
    }
  };

  if (loadingCommunity || loadingPosts) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  if (!community) return null;

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="relative h-64 rounded-lg overflow-hidden mb-8">
        <img
          src={community.thumbnail}
          alt={community.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50 flex items-end">
          <div className="p-8 text-white">
            <h1 className="text-4xl font-bold mb-2">{community.name}</h1>
            <p className="text-lg opacity-90 mb-4">{community.description}</p>
            <div className="flex items-center gap-4">
              {community.isLocal && <Badge>Local Community</Badge>}
              <div className="flex items-center text-sm">
                <Users className="h-4 w-4 mr-1" />
                <span>Members</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-4">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input placeholder="Post title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea
                            placeholder="What's on your mind?"
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit">
                    <MessageSquarePlus className="mr-2 h-4 w-4" />
                    Create Post
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {posts?.map((post) => (
            <Card key={post.id}>
              <CardContent className="p-4">
                <div className="flex items-center space-x-4 mb-4">
                  <Avatar>
                    <AvatarFallback>
                      {post.authorId % USER_AVATARS.length}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">User #{post.authorId}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(post.createdAt), "MMM d, yyyy")}
                    </p>
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-2">{post.title}</h3>
                <p className="text-muted-foreground">{post.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>About Community</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {community.description}
              </p>
              <Button
                className="w-full"
                onClick={() => joinMutation.mutate()}
                disabled={joinMutation.isPending}
              >
                {joinMutation.isPending ? "Joining..." : "Join Community"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
