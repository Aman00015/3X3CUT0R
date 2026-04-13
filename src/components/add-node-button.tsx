"use client";

import { memo } from "react";
import { Button } from "./ui/button";
import { PlusIcon } from "lucide-react";

export const AddNodeButton = memo(() => {
    return (
      <Button
        onClick={() => {}}
        size={"icon"}
        variant={"outline"}
        className="bg-background"
      >
        <PlusIcon />
    </Button>
    );
  });

AddNodeButton.displayName = "AddNodeButton"