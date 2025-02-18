import { useQuery } from "@tanstack/react-query";
import { Community } from "@shared/schema";
import { Button } from "@/components/ui/button";
import CommunityCard from "@/components/community-card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertCommunitySchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, Plus } from "lucide-react";

// Community thumbnail images
const COMMUNITY_IMAGES = [
  "https://images.unsplash.com/photo-1522543558187-768b6df7c25c",
  "https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a",
  "https://images.unsplash.com/photo-1528605248644-14dd04022da1",
  "https://images.unsplash.com/photo-1511632765486-a01980e01a18",
  "https://images.unsplash.com/photo-1520857014576-2c4f4c972b57",
  "https://images.unsplash.com/photo-1529209076408-5a115ec9f1c6",
];

export default function HomePage() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();

  const { data: communities, isLoading } = useQuery<Community[]>({
    queryKey: ["/api/communities"],
  });

  const form = useForm({
    resolver: zodResolver(insertCommunitySchema),
    defaultValues: {
      name: "",
      description: "",
      thumbnail: COMMUNITY_IMAGES[0],
      isLocal: false,
    },
  });

  const onSubmit = async (data: any) => {
    try {
      await apiRequest("POST", "/api/communities", data);
      queryClient.invalidateQueries({ queryKey: ["/api/communities"] });
      setOpen(false);
      form.reset();
    } catch (error) {
      console.error("Failed to create community:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Welcome, {user?.username}!</h1>
          <p className="text-muted-foreground mt-2">
            Discover and join communities that interest you
          </p>
        </div>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Community
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a New Community</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="thumbnail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Thumbnail</FormLabel>
                      <div className="grid grid-cols-3 gap-2">
                        {COMMUNITY_IMAGES.map((image) => (
                          <img
                            key={image}
                            src={image}
                            alt="Thumbnail option"
                            className={`w-full h-24 object-cover cursor-pointer rounded-md ${
                              field.value === image ? "ring-2 ring-primary" : ""
                            }`}
                            onClick={() => form.setValue("thumbnail", image)}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="isLocal"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between">
                      <FormLabel>Local Community</FormLabel>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full">
                  Create Community
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {communities?.map((community) => (
          <CommunityCard key={community.id} community={community} />
        ))}
      </div>
    </main>
  );
}
