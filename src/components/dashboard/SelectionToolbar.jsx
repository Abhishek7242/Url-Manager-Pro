import React, { useContext } from "react";
import {
  FiLoader,
  FiTag,
  FiArchive,
  FiDownload,
  FiTrash2,
} from "react-icons/fi";
import "../CSS/SelectionToolbar.css";
import UrlContext from "../../context/url_manager/UrlContext";

export default function SelectionToolbar({
  selectedCount = 0,
  onTag = () => {},
  onArchive = () => {},
  onExport = () => {},
  onDelete = () => {},
  isArchiving = false,
  isExporting = false,
  isDeleting = false,
}) {
  const [loading, setLoading] = React.useState({
    tag: false,
  });
  const { archive } = useContext(UrlContext);

  if (!selectedCount) return null;

  return (
    <div
      className="selection-toolbar"
      role="region"
      aria-label="Selection toolbar"
    >
      <div className="sel-left">
        <span className="sel-count">{selectedCount} selected</span>
      </div>

      <div className="sel-actions">
        {/* <button
          className={`btn btn-outline ${loading.tag ? "loading" : ""}`}
          onClick={async () => {
            setLoading((prev) => ({ ...prev, tag: true }));
            await onTag();
            setLoading((prev) => ({ ...prev, tag: false }));
          }}
          disabled={loading.tag}
        >
          <FiTag className={`ri ${loading.tag ? "spin" : ""}`} />
          <span>Tag</span>
        </button> */}

        <button
          className={`btn btn-outline ${isArchiving ? "loading" : ""}`}
          onClick={onArchive}
          disabled={isArchiving}
          title={
            archive
              ? "Move selected URLs back to active"
              : "Move selected URLs to archive"
          }
        >
          {isArchiving ? (
            <>
              <FiLoader
                className="animate-spin"
                style={{ marginRight: "8px" }}
              />
              <span>{archive ? "Moving..." : "Archiving..."}</span>
            </>
          ) : (
            <>
              <FiArchive className="ri" />
              <span>{archive ? "Move to Active" : "Archive"}</span>
            </>
          )}
        </button>

        <button
          className={`btn btn-outline ${isExporting ? "loading" : ""}`}
          onClick={onExport}
          disabled={isExporting}
        >
          {isExporting ? (
            <>
              <FiLoader
                className="animate-spin"
                style={{ marginRight: "8px" }}
              />
              <span>Exporting...</span>
            </>
          ) : (
            <>
              <FiDownload className="ri" />
              <span>Export</span>
            </>
          )}
        </button>

        <button
          className={`btn btn-danger ${isDeleting ? "loading" : ""}`}
          onClick={onDelete}
          disabled={isDeleting}
        >
          {isDeleting ? (
            <>
              <FiLoader
                className="animate-spin"
                style={{ marginRight: "8px" }}
              />
              <span>Deleting...</span>
            </>
          ) : (
            <>
              <FiTrash2 className="ri" />
              <span>Delete</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
