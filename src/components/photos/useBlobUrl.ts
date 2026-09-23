import { useEffect, useState } from "react";
import { getBlobUrl } from "@/lib/storage/photos";

export function useBlobUrl(blobId?: string | null) {
  const [url, setUrl] = useState<string>();

  useEffect(() => {
    if (!blobId) {
      setUrl(undefined);
      return;
    }
    let cancelled = false;
    void getBlobUrl(blobId).then((next) => {
      if (!cancelled) setUrl(next);
    });
    return () => {
      cancelled = true;
    };
  }, [blobId]);

  return url;
}
