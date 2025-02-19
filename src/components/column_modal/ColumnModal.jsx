import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, arrayMove, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const SortableItem = ({ column, index }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: column.key });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    padding: '8px',
    border: '1px solid #ddd',
    cursor: 'grab',
    background: '#fff',
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {column.label}
    </div>
  );
};

const ColumnSettings = ({ columns, setColumns }) => {
  const onDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = columns.findIndex((col) => col.key === active.id);
      const newIndex = columns.findIndex((col) => col.key === over.id);
      setColumns(arrayMove(columns, oldIndex, newIndex));
    }
  };

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={columns.map((col) => col.key)}>
        {columns.map((column, index) => (
          <SortableItem key={column.key} column={column} index={index} />
        ))}
      </SortableContext>
    </DndContext>
  );
};
