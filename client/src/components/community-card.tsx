import { Community } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Link } from "wouter";

interface CommunityCardProps {
  community: Community;
}

export default function CommunityCard({ community }: CommunityCardProps) {
  return (
    <Link href={`/c/${community.id}`}>
      <Card className="cursor-pointer hover:shadow-lg transition-shadow">
        <CardHeader className="relative p-0">
          <img
            src={community.thumbnail}
            alt={community.name}
            className="w-full h-48 object-cover rounded-t-lg"
          />
          {community.isLocal && (
            <Badge className="absolute top-2 right-2">Local</Badge>
          )}
        </CardHeader>
        <CardContent className="pt-4">
          <CardTitle className="text-xl mb-2">{community.name}</CardTitle>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {community.description}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
