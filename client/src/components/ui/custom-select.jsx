import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

/**
 * A drop-in replacement for native HTML <select> elements.
 * Accepts standard select props (value, onChange, name, id, className) and <option> children,
 * but renders the premium Shadcn UI Select component.
 */
export function CustomSelect({ 
  value, 
  onChange, 
  name, 
  id, 
  className, 
  children, 
  placeholder = "Select an option",
  disabled = false
}) {
  // Extract options from children (which are <option> elements)
  const options = React.Children.toArray(children).map(child => {
    if (React.isValidElement(child) && child.type === 'option') {
      return {
        value: child.props.value,
        label: child.props.children
      };
    }
    return null;
  }).filter(Boolean);

  // Handle Shadcn's string-only onValueChange and bridge it back to the native onChange(e)
  const handleValueChange = (newValue) => {
    if (onChange) {
      // Create a synthetic event object to maintain compatibility with existing handlers
      const syntheticEvent = {
        target: {
          name: name,
          value: newValue,
          id: id
        }
      };
      onChange(syntheticEvent);
    }
  };

  // Find the label for the currently selected value to display if needed, 
  // though SelectValue usually handles this automatically if the SelectItem matches.
  const stringValue = value !== null && value !== undefined ? String(value) : "";

  return (
    <Select value={stringValue} onValueChange={handleValueChange} disabled={disabled}>
      <SelectTrigger id={id} className={cn("w-full", className)}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((opt, index) => {
          // Shadcn SelectItem cannot have an empty string value, it breaks Radix UI.
          // Native selects often use <option value="">Select...</option>
          // We map empty string to a special constant and filter it out, or render it as disabled.
          if (opt.value === "" || opt.value === undefined) {
             return null; // Don't render the placeholder option inside the dropdown list
          }
          return (
            <SelectItem key={`${opt.value}-?{index}`} value={String(opt.value)}>
              {opt.label}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
