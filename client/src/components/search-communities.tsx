import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Community } from "@shared/schema";
import { Command, CommandGroup, CommandItem, CommandInput } from "./ui/command";
import { useLocation } from "wouter";

export default function SearchCommunities() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [, setLocation] = useLocation();

  const { data: communities } = useQuery<Community[]>({
    queryKey: ["/api/communities", search],
    enabled: open,
  });

  return (
    <Command className="rounded-lg border shadow-md w-full max-w-lg">
      <CommandInput
        placeholder="Search communities..."
        value={search}
        onValueChange={setSearch}
      />
      {open && communities && (
        <CommandGroup className="max-h-64 overflow-y-auto">
          {communities.map((community) => (
            <CommandItem
              key={community.id}
              value={community.name}
              onSelect={() => {
                setLocation(`/c/${community.id}`);
                setOpen(false);
              }}
            >
              {community.name}
            </CommandItem>
          ))}
        </CommandGroup>
      )}
    </Command>
  );
}
