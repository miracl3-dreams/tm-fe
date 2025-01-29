import Button from "@/components/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@radix-ui/react-tooltip";
import React from "react";

const Test = () => {
  return (
    <>
      <div className="flex items-center justify-center h-screen w-full">
        <Card>
          <CardHeader>
            <CardTitle>Task</CardTitle>
            <CardDescription>Description</CardDescription>
          </CardHeader>
          <CardContent>
            <div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Button>Test</Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="bg-black text-white p-2 rounded-md">
                      This is a test for tooltip components
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default Test;
