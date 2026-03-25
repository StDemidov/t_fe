import React, { useState, useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  DndContext,
  closestCenter,
  useDroppable,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  defaultDropAnimation,
} from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  returnToStart,
  selectRegroupedItems,
  setGroups,
} from '../../../redux/slices/regroupSlice';
import styles from './style.module.css';
import InfoMessage from './elements/InfoMessage';
import RegroupActionButtons from './elements/RegroupActionButtons';

// ================= HELPERS =================
const findGroupIndex = (groups, itemId) => {
  return groups.findIndex((group) =>
    group.some((item) => item.vcId === itemId)
  );
};

// ================= EMPTY GROUP =================
const EmptyGroupCard = ({ index }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `empty-group-${index}`,
    data: {
      type: 'empty-group',
      groupIndex: index,
      isEmpty: true,
    },
  });

  return (
    <div
      ref={setNodeRef}
      className={`${styles.groupCard} ${styles.emptyGroupCard} ${
        isOver ? styles.groupCardOver : ''
      }`}
    >
      <div className={styles.groupTitle}>
        Новая группа
        <span className={styles.groupCount}>0</span>
      </div>
      <div className={styles.emptyGroupContent}>
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 4V20M20 12H4"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
        <p>Перетащите сюда для создания новой группы</p>
      </div>
    </div>
  );
};

// ================= ITEM =================
const ItemCard = ({ item }) => {
  const {
    setNodeRef,
    listeners,
    attributes,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: item.vcId,
    data: {
      type: 'item',
      item,
    },
    disabled: false,
  });

  const [isHovered, setIsHovered] = useState(false);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : transition,
    backgroundImage: `url(${item.image || 'https://via.placeholder.com/150'})`,
    opacity: isDragging ? 0.5 : 1,
    backgroundPosition: 'center',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
  };

  // Обрезаем артикул если он длинный
  const vendorCode = item.vendorCode || '';
  const truncatedVendorCode =
    vendorCode.length > 15 ? `${vendorCode.slice(0, 15)}...` : vendorCode;

  return (
    <div
      ref={setNodeRef}
      className={styles.item}
      style={style}
      {...listeners}
      {...attributes}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Блок с количеством кликов сверху слева */}
      {item.clicksCount !== undefined && item.clicksCount !== null && (
        <div className={styles.clicksCount}>{item.clicksCount}</div>
      )}

      {/* Блок с артикулом снизу */}
      <div className={styles.vendorCodeContainer}>
        <div
          className={`${styles.vendorCode} ${
            isHovered ? styles.vendorCodeMarquee : ''
          }`}
        >
          {isHovered ? vendorCode : truncatedVendorCode}
        </div>
      </div>
    </div>
  );
};

// ================= GROUP =================
const GroupCard = ({ group, index }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `group-${index}`,
    data: {
      type: 'group',
      groupIndex: index,
    },
  });

  return (
    <div
      ref={setNodeRef}
      className={`${styles.groupCard} ${isOver ? styles.groupCardOver : ''}`}
    >
      <div className={styles.groupTitle}>
        Группа {index + 1}
        <span className={styles.groupCount}>{group.length}</span>
      </div>

      <div className={styles.itemsRowWrapper}>
        <div className={styles.itemsRow}>
          {group.map((item) => (
            <ItemCard key={item.vcId} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
};

// ================= MAIN =================
const RegroupGroupsPage = () => {
  const dispatch = useDispatch();
  const regroupedItems = useSelector(selectRegroupedItems);

  const [activeItem, setActiveItem] = useState(null);
  const [activeGroupIndex, setActiveGroupIndex] = useState(null);

  // Проверяем, есть ли уже пустая группа
  const hasEmptyGroup = useMemo(() => {
    return regroupedItems.some((group) => group.isEmpty === true);
  }, [regroupedItems]);

  // Создаем массив групп с пустой группой в конце
  const groupsWithEmpty = useMemo(() => {
    const groups = [...regroupedItems];
    if (!hasEmptyGroup) {
      groups.push({ isEmpty: true, items: [] });
    }
    return groups;
  }, [regroupedItems, hasEmptyGroup]);

  // Настройка сенсоров
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    })
  );

  // --- START DRAG
  const handleDragStart = useCallback(
    (event) => {
      const { active } = event;
      const item = regroupedItems.flat().find((i) => i.vcId === active.id);
      const groupIndex = findGroupIndex(regroupedItems, active.id);

      setActiveItem(item || null);
      setActiveGroupIndex(groupIndex);
    },
    [regroupedItems]
  );

  // --- END DRAG
  const handleDragEnd = useCallback(
    (event) => {
      const { active, over } = event;

      setActiveItem(null);
      setActiveGroupIndex(null);

      if (!over) return;

      // Получаем исходную группу
      const sourceGroupIndex = findGroupIndex(regroupedItems, active.id);
      if (sourceGroupIndex === -1) return;

      let targetGroupIndex = null;
      let isTargetEmpty = false;

      // Определяем целевую группу
      if (over.data?.current?.type === 'group') {
        targetGroupIndex = over.data.current.groupIndex;
      } else if (over.data?.current?.type === 'empty-group') {
        targetGroupIndex = over.data.current.groupIndex;
        isTargetEmpty = true;
      } else if (over.id && String(over.id).startsWith('group-')) {
        targetGroupIndex = Number(over.id.split('-')[1]);
      } else if (over.id && String(over.id).startsWith('empty-group-')) {
        targetGroupIndex = Number(over.id.split('-')[2]);
        isTargetEmpty = true;
      }

      if (targetGroupIndex === null || targetGroupIndex === -1) return;

      // Если цель - пустая группа, то targetGroupIndex может быть больше реального количества групп
      // Нам нужно создать новую группу
      if (isTargetEmpty) {
        // Создаем копии групп
        const newGroups = [...regroupedItems];
        const sourceGroup = [...newGroups[sourceGroupIndex]];

        // Находим перемещаемый элемент
        const movedItemIndex = sourceGroup.findIndex(
          (i) => i.vcId === active.id
        );
        if (movedItemIndex === -1) return;

        const [movedItem] = sourceGroup.splice(movedItemIndex, 1);

        // Обновляем исходную группу
        newGroups[sourceGroupIndex] = sourceGroup;

        // Создаем новую группу с перемещенным элементом
        const newGroup = [movedItem];

        // Добавляем новую группу перед пустой
        const finalGroups = [...newGroups, newGroup];

        // Удаляем пустые группы (старые)
        const nonEmptyGroups = finalGroups.filter(
          (group) => !group.isEmpty && group.length > 0
        );

        // Обновляем Redux
        dispatch(setGroups(nonEmptyGroups));
        return;
      }

      // Обычное перемещение между существующими группами
      // Не перемещаем в ту же группу
      if (sourceGroupIndex === targetGroupIndex) return;

      // Создаем копии групп
      const newGroups = [...regroupedItems];
      const sourceGroup = [...newGroups[sourceGroupIndex]];
      const targetGroup = [...newGroups[targetGroupIndex]];

      // Находим перемещаемый элемент
      const movedItemIndex = sourceGroup.findIndex((i) => i.vcId === active.id);
      if (movedItemIndex === -1) return;

      const [movedItem] = sourceGroup.splice(movedItemIndex, 1);

      // Добавляем элемент в целевую группу
      targetGroup.push(movedItem);

      // Обновляем группы
      newGroups[sourceGroupIndex] = sourceGroup;
      newGroups[targetGroupIndex] = targetGroup;

      // Удаляем пустые группы
      const filteredGroups = newGroups.filter((group) => group.length > 0);

      // Обновляем Redux
      dispatch(setGroups(filteredGroups));
    },
    [regroupedItems, dispatch]
  );

  // Обработчик отмены перетаскивания
  const handleDragCancel = useCallback(() => {
    setActiveItem(null);
    setActiveGroupIndex(null);
  }, []);

  // Настройка анимации дропа - делаем так, чтобы элемент просто исчезал
  const dropAnimation = {
    ...defaultDropAnimation,
    duration: 150,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    dragSourceOpacity: 0.5,
  };

  // Если нет данных для отображения
  if (!regroupedItems || regroupedItems.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>Нет доступных групп для отображения</p>
      </div>
    );
  }

  return (
    <div>
      <RegroupActionButtons />
      <InfoMessage />
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className={styles.inputGroups}>
          {regroupedItems.map((group, index) => (
            <GroupCard key={`group-${index}`} group={group} index={index} />
          ))}
          {/* Пустая группа всегда в конце */}
          <EmptyGroupCard key="empty-group" index={regroupedItems.length} />
        </div>

        {/* Drag preview */}
        <DragOverlay dropAnimation={dropAnimation}>
          {activeItem ? (
            <div
              className={styles.dragOverlay}
              style={{
                backgroundImage: `url(${
                  activeItem.image || 'https://via.placeholder.com/150'
                })`,
                backgroundPosition: 'center',
                backgroundSize: 'cover',
                backgroundRepeat: 'no-repeat',
              }}
            >
              <div className={styles.dragOverlayInfo}>
                {activeGroupIndex !== null && (
                  <span>Из группы {activeGroupIndex + 1}</span>
                )}
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

export default RegroupGroupsPage;
