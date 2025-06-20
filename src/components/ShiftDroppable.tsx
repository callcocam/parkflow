import { useDroppable } from '@dnd-kit/core';

export function ShiftDroppable({ id, children }: { id: string, children: React.ReactNode }) {
    const { isOver, setNodeRef } = useDroppable({
        id: id,
    });
    const style = {
        backgroundColor: isOver ? '#e0e0e0' : undefined,
    };

    return (
        <div ref={setNodeRef} style={style}>
            {children}
        </div>
    );
} 