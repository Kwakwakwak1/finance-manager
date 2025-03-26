import React, { useState, useRef, useEffect } from 'react';
import { Button, Overlay, Popover } from 'react-bootstrap';
import './ActionMenu.css';

const ActionMenu = ({ onEdit, onDelete, onToggle, isActive }) => {
  const [showMenu, setShowMenu] = useState(false);
  const target = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (target.current && !target.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="action-menu-container">
      <Button
        ref={target}
        variant="light"
        size="sm"
        className="action-menu-button"
        onClick={() => setShowMenu(!showMenu)}
      >
        <i className="bi bi-three-dots-vertical"></i>
      </Button>

      <Overlay
        show={showMenu}
        target={target.current}
        placement="bottom-start"
        containerPadding={20}
        rootClose
        onHide={() => setShowMenu(false)}
      >
        <Popover id="popover-action-menu" className="action-menu-popover">
          <Popover.Body className="p-1">
            <Button
              variant="outline-primary"
              size="sm"
              className="action-button d-block w-100 mb-1 text-start"
              onClick={() => {
                onEdit();
                setShowMenu(false);
              }}
            >
              <i className="bi bi-pencil me-2"></i>
              Edit
            </Button>
            <Button
              variant="outline-danger"
              size="sm"
              className="action-button d-block w-100 mb-1 text-start"
              onClick={() => {
                onDelete();
                setShowMenu(false);
              }}
            >
              <i className="bi bi-trash me-2"></i>
              Delete
            </Button>
            <Button
              variant={isActive ? "outline-warning" : "outline-success"}
              size="sm"
              className="action-button d-block w-100 text-start"
              onClick={() => {
                onToggle();
                setShowMenu(false);
              }}
            >
              <i className={`bi ${isActive ? "bi-power me-2" : "bi-check-circle me-2"}`}></i>
              {isActive ? 'Disable' : 'Enable'}
            </Button>
          </Popover.Body>
        </Popover>
      </Overlay>
    </div>
  );
};

export default ActionMenu; 