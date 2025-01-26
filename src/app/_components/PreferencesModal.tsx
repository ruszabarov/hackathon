import { Button } from "@components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@components/ui/dialog";
import { Textarea } from "@components/ui/textarea";
import { Pencil } from "lucide-react";
import { useState, useEffect } from "react";
import { updatePreference, getPreference } from "../../server/queries";
import { useToast } from "../../hooks/use-toast";

export const PreferencesModal = () => {
  const [preference, setPreference] = useState("");
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPreference = async () => {
      const pref = await getPreference();
      if (pref) {
        setPreference(pref);
      }
    };
    void fetchPreference();
  }, []);

  const handleSubmit = async () => {
    try {
      await updatePreference(preference);
      toast({
        title: "Success",
        description: "Your preferences have been updated.",
      });
      setOpen(false);
    } catch (error) {
      console.error("Error submitting preference:", error);
      toast({
        title: "Error",
        description: "Failed to update preferences.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Pencil className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Preferences</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <Textarea
            placeholder="Enter your preference"
            value={preference}
            onChange={(e) => setPreference(e.target.value)}
            className="min-h-[100px]"
          />
          <Button onClick={handleSubmit}>Submit</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
