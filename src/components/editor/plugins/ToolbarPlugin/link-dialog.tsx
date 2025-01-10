import * as React from 'react';
import { Link } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { TOGGLE_LINK_COMMAND } from '@lexical/link';
import type { LexicalEditor } from 'lexical';
import { sanitizeUrl } from '../../utils/url';

interface LinkDialogProps {
  editor: LexicalEditor;
  isLink: boolean;
  disabled?: boolean;
  setIsLinkEditMode: (isLink: boolean) => void;
}

export function LinkDialog({
  editor,
  isLink,
  disabled = false,
  setIsLinkEditMode,
}: LinkDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [url, setUrl] = React.useState('https://');

  const insertLink = React.useCallback(() => {
    if (!isLink) {
      setIsLinkEditMode(true);
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, sanitizeUrl(url));
    } else {
      setIsLinkEditMode(false);
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    }
    setOpen(false);
  }, [editor, isLink, setIsLinkEditMode, url]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          disabled={disabled}
          className="h-8 w-8"
          aria-label={isLink ? "Edit link" : "Insert link"}
        >
          <Link className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isLink ? 'Edit Link' : 'Insert Link'}</DialogTitle>
          <DialogDescription>
            Add a link to your text. The link should start with http:// or https://.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2">
          <div className="grid flex-1 gap-2">
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter a URL"
            />
          </div>
        </div>
        <DialogFooter className="sm:justify-start">
          <Button
            type="button"
            variant={isLink ? "destructive" : "default"}
            onClick={insertLink}
          >
            {isLink ? 'Remove Link' : 'Save Link'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
