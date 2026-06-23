import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type TutorialPlayerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  videoUrl: string;
};

export function TutorialPlayer({
  open,
  onOpenChange,
  title,
  description,
  videoUrl,
}: TutorialPlayerProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-5 pt-5 pb-3">
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <div className="aspect-video w-full bg-black">
          <video
            key={videoUrl}
            src={videoUrl}
            controls
            playsInline
            className="h-full w-full"
            preload="metadata"
          >
            Your browser does not support embedded video playback.
          </video>
        </div>
      </DialogContent>
    </Dialog>
  );
}
