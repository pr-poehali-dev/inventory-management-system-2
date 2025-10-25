import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface Item {
  id: string;
  name: string;
  description: string;
  location: string;
  imageUrl: string;
}

const Index = () => {
  const { toast } = useToast();
  const [items, setItems] = useState<Item[]>([
    {
      id: '1',
      name: 'Все вещи',
      description: 'Корневая категория для всех предметов',
      location: '',
      imageUrl: '/placeholder.svg'
    },
    {
      id: '2',
      name: 'Офисный шкаф',
      description: 'Металлический шкаф для документов',
      location: 'Все вещи',
      imageUrl: '/placeholder.svg'
    },
    {
      id: '3',
      name: 'Папка "Договоры 2024"',
      description: 'Договоры с контрагентами за 2024 год',
      location: 'Офисный шкаф',
      imageUrl: '/placeholder.svg'
    }
  ]);

  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isMoveDialogOpen, setIsMoveDialogOpen] = useState(false);
  const [movingItem, setMovingItem] = useState<Item | null>(null);
  const [newLocation, setNewLocation] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: 'Все вещи',
    imageUrl: '/placeholder.svg'
  });

  const handleAddItem = () => {
    const newItem: Item = {
      id: Date.now().toString(),
      ...formData
    };
    setItems([...items, newItem]);
    setFormData({ name: '', description: '', location: 'Все вещи', imageUrl: '/placeholder.svg' });
    setIsAddDialogOpen(false);
    toast({ title: 'Вещь добавлена', description: `${newItem.name} успешно добавлен в инвентарь` });
  };

  const handleEditItem = () => {
    if (!editingItem) return;
    setItems(items.map(item => item.id === editingItem.id ? editingItem : item));
    setIsEditDialogOpen(false);
    setEditingItem(null);
    toast({ title: 'Изменения сохранены', description: 'Данные вещи обновлены' });
  };

  const handleMoveItem = () => {
    if (!movingItem) return;
    setItems(items.map(item => 
      item.id === movingItem.id ? { ...item, location: newLocation } : item
    ));
    setIsMoveDialogOpen(false);
    setMovingItem(null);
    setNewLocation('');
    toast({ title: 'Вещь перемещена', description: `Местоположение изменено на "${newLocation}"` });
  };

  const handleDeleteItem = (id: string) => {
    if (id === '1') {
      toast({ title: 'Ошибка', description: 'Нельзя удалить корневую категорию', variant: 'destructive' });
      return;
    }
    setItems(items.filter(item => item.id !== id));
    toast({ title: 'Вещь удалена', description: 'Запись удалена из инвентаря' });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isEditing: boolean = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const imageUrl = reader.result as string;
      if (isEditing && editingItem) {
        setEditingItem({ ...editingItem, imageUrl });
      } else {
        setFormData({ ...formData, imageUrl });
      }
    };
    reader.readAsDataURL(file);
  };

  const openEditDialog = (item: Item) => {
    setEditingItem({ ...item });
    setIsEditDialogOpen(true);
  };

  const openMoveDialog = (item: Item) => {
    setMovingItem(item);
    setNewLocation(item.location);
    setIsMoveDialogOpen(true);
  };

  const getItemsByLocation = (location: string) => {
    return items.filter(item => item.location === location);
  };

  const renderItemTree = (parentName: string, level: number = 0): JSX.Element[] => {
    const childItems = getItemsByLocation(parentName);
    
    return childItems.map((item) => {
      const hasChildren = getItemsByLocation(item.name).length > 0;
      
      return (
        <div key={item.id}>
          <div
            className="flex items-center gap-4 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            style={{ marginLeft: `${level * 24}px` }}
          >
            <div className="flex items-center gap-2 flex-shrink-0">
              {level > 0 && (
                <div className="w-6 h-6 flex items-center justify-center">
                  <div className="w-3 h-px bg-gray-300"></div>
                </div>
              )}
              {hasChildren ? (
                <Icon name="FolderOpen" size={20} className="text-primary" />
              ) : (
                <Icon name="Package2" size={20} className="text-gray-400" />
              )}
            </div>
            <img
              src={item.imageUrl}
              alt={item.name}
              className="w-16 h-16 object-cover rounded border border-gray-200"
            />
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-gray-900">{item.name}</h4>
              <p className="text-sm text-gray-600 truncate">{item.description}</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => openEditDialog(item)}
              >
                <Icon name="Pencil" size={14} />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => openMoveDialog(item)}
              >
                <Icon name="ArrowRightLeft" size={14} />
              </Button>
            </div>
          </div>
          {hasChildren && (
            <div className="mt-3 space-y-3">
              {renderItemTree(item.name, level + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Icon name="Package" size={28} className="text-primary" />
              <h1 className="text-2xl font-semibold text-gray-900">Система инвентаризации</h1>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Icon name="Plus" size={18} />
                  Добавить вещь
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Новая вещь</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Название</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Введите название"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Описание</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Введите описание"
                      rows={3}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="location">Местоположение</Label>
                    <Select
                      value={formData.location}
                      onValueChange={(value) => setFormData({ ...formData, location: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {items.map((item) => (
                          <SelectItem key={item.id} value={item.name}>
                            {item.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="imageUrl">Фотография</Label>
                    <div className="flex gap-2">
                      <Input
                        id="imageUrl"
                        value={formData.imageUrl}
                        onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                        placeholder="/placeholder.svg"
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('file-upload-add')?.click()}
                        className="gap-2"
                      >
                        <Icon name="Camera" size={18} />
                        Загрузить
                      </Button>
                      <input
                        id="file-upload-add"
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={(e) => handleImageUpload(e, false)}
                        className="hidden"
                      />
                    </div>
                    {formData.imageUrl && (
                      <div className="mt-2">
                        <img
                          src={formData.imageUrl}
                          alt="Предпросмотр"
                          className="w-full h-48 object-cover rounded-lg border border-gray-200"
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Отмена
                  </Button>
                  <Button onClick={handleAddItem} disabled={!formData.name}>
                    Добавить
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <Tabs defaultValue="inventory" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="inventory" className="gap-2">
              <Icon name="List" size={18} />
              Инвентарь
            </TabsTrigger>
            <TabsTrigger value="categories" className="gap-2">
              <Icon name="FolderTree" size={18} />
              Категории
            </TabsTrigger>
          </TabsList>

          <TabsContent value="inventory">
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="w-16">Фото</TableHead>
                    <TableHead>Название</TableHead>
                    <TableHead>Описание</TableHead>
                    <TableHead>Местоположение</TableHead>
                    <TableHead className="text-right w-48">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id} className="hover:bg-gray-50 transition-colors">
                      <TableCell>
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-12 h-12 object-cover rounded border border-gray-200"
                        />
                      </TableCell>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell className="text-gray-600 max-w-md truncate">{item.description}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="font-normal">
                          {item.location || '—'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(item)}
                            className="gap-1"
                          >
                            <Icon name="Pencil" size={14} />
                            Изменить
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openMoveDialog(item)}
                            className="gap-1"
                          >
                            <Icon name="ArrowRightLeft" size={14} />
                            Переместить
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteItem(item.id)}
                            className="gap-1"
                          >
                            <Icon name="Trash2" size={14} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="categories">
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <Icon name="FolderTree" size={20} className="text-primary" />
                  <h3 className="text-lg font-semibold text-gray-900">Иерархия вещей</h3>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {renderItemTree('Все вещи')}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Редактирование вещи</DialogTitle>
          </DialogHeader>
          {editingItem && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Название</Label>
                <Input
                  id="edit-name"
                  value={editingItem.name}
                  onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-description">Описание</Label>
                <Textarea
                  id="edit-description"
                  value={editingItem.description}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-location">Местоположение</Label>
                <Select
                  value={editingItem.location}
                  onValueChange={(value) => setEditingItem({ ...editingItem, location: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {items.map((item) => (
                      <SelectItem key={item.id} value={item.name}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-imageUrl">Фотография</Label>
                <div className="flex gap-2">
                  <Input
                    id="edit-imageUrl"
                    value={editingItem.imageUrl}
                    onChange={(e) => setEditingItem({ ...editingItem, imageUrl: e.target.value })}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('file-upload-edit')?.click()}
                    className="gap-2"
                  >
                    <Icon name="Camera" size={18} />
                    Загрузить
                  </Button>
                  <input
                    id="file-upload-edit"
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={(e) => handleImageUpload(e, true)}
                    className="hidden"
                  />
                </div>
                {editingItem.imageUrl && (
                  <div className="mt-2">
                    <img
                      src={editingItem.imageUrl}
                      alt="Предпросмотр"
                      className="w-full h-48 object-cover rounded-lg border border-gray-200"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleEditItem}>
              Сохранить
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isMoveDialogOpen} onOpenChange={setIsMoveDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Переместить вещь</DialogTitle>
          </DialogHeader>
          {movingItem && (
            <div className="grid gap-4 py-4">
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-3">
                  <img
                    src={movingItem.imageUrl}
                    alt={movingItem.name}
                    className="w-12 h-12 object-cover rounded border border-gray-200"
                  />
                  <div>
                    <p className="font-medium">{movingItem.name}</p>
                    <p className="text-sm text-gray-600">Текущее: {movingItem.location || '—'}</p>
                  </div>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="new-location">Новое местоположение</Label>
                <Select value={newLocation} onValueChange={setNewLocation}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите местоположение" />
                  </SelectTrigger>
                  <SelectContent>
                    {items
                      .filter(item => item.id !== movingItem.id)
                      .map((item) => (
                        <SelectItem key={item.id} value={item.name}>
                          {item.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsMoveDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleMoveItem}>
              Переместить
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;