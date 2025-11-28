import { useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { Icon, LatLngExpression } from 'leaflet';
import { MapPin, Plus, Route } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// 修复默认图标
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// @ts-ignore
delete Icon.Default.prototype._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

interface Location {
  id: string;
  name: string;
  lat: number;
  lng: number;
  date: string;
  type: 'visited' | 'planned';
  description?: string;
}

const visitedIcon = new Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const plannedIcon = new Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

export default function MapView() {
  const [locations, setLocations] = useState<Location[]>([
    { id: '1', name: '北京', lat: 39.9042, lng: 116.4074, date: '2024-01-15', type: 'visited', description: '故宫、长城之旅' },
    { id: '2', name: '上海', lat: 31.2304, lng: 121.4737, date: '2024-03-20', type: 'visited', description: '外滩夜景' },
    { id: '3', name: '成都', lat: 30.5728, lng: 104.0668, date: '2024-06-10', type: 'visited', description: '熊猫基地' },
    { id: '4', name: '西安', lat: 34.3416, lng: 108.9398, date: '2025-01-01', type: 'planned', description: '兵马俑计划' },
    { id: '5', name: '杭州', lat: 30.2741, lng: 120.1551, date: '2025-03-15', type: 'planned', description: '西湖春游' },
  ]);

  const [showRoute, setShowRoute] = useState(true);
  const [selectedType, setSelectedType] = useState<'all' | 'visited' | 'planned'>('all');
  const [isAdding, setIsAdding] = useState(false);
  const [newLoc, setNewLoc] = useState({ name: '', lat: '', lng: '', description: '', type: 'planned' as const });

  const mapCenter = useMemo<LatLngExpression>(() => {
    if (locations.length === 0) return [35.86, 104.19];
    const avgLat = locations.reduce((s, l) => s + l.lat, 0) / locations.length;
    const avgLng = locations.reduce((s, l) => s + l.lng, 0) / locations.length;
    return [avgLat, avgLng];
  }, [locations]);

  const filtered = useMemo(() => {
    if (selectedType === 'all') return locations;
    return locations.filter(l => l.type === selectedType);
  }, [locations, selectedType]);

  const routePath = useMemo<LatLngExpression[]>(() => {
    return locations
      .filter(l => l.type === 'visited')
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(l => [l.lat, l.lng]);
  }, [locations]);

  const handleAdd = () => {
    if (!newLoc.name || !newLoc.lat || !newLoc.lng) return;
    setLocations([...locations, {
      id: Date.now().toString(),
      name: newLoc.name,
      lat: parseFloat(newLoc.lat),
      lng: parseFloat(newLoc.lng),
      date: new Date().toISOString().split('T')[0],
      type: newLoc.type,
      description: newLoc.description,
    }]);
    setNewLoc({ name: '', lat: '', lng: '', description: '', type: 'planned' });
    setIsAdding(false);
  };

  const handleDelete = (id: string) => setLocations(locations.filter(l => l.id !== id));
  const handleVisit = (id: string) => setLocations(locations.map(l => 
    l.id === id ? { ...l, type: 'visited' as const, date: new Date().toISOString().split('T')[0] } : l
  ));

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" /> 足迹地图
          </h2>
          <div className="flex gap-1 bg-slate-100 dark:bg-slate-700 p-1 rounded-lg">
            {(['all', 'visited', 'planned'] as const).map(t => (
              <button key={t} onClick={() => setSelectedType(t)}
                className={`px-3 py-1 text-sm rounded ${selectedType === t ? 'bg-white dark:bg-slate-600 text-blue-600 shadow-sm' : 'text-slate-600 dark:text-slate-400'}`}>
                {t === 'all' ? '全部' : t === 'visited' ? '已访问' : '计划中'}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowRoute(!showRoute)}
            className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg ${showRoute ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
            <Route className="w-4 h-4" /> 路线
          </button>
          <button onClick={() => setIsAdding(true)} className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Plus className="w-4 h-4" /> 添加
          </button>
        </div>
      </div>

      {isAdding && (
        <div className="p-4 bg-slate-50 dark:bg-slate-700/50 border-b grid grid-cols-2 md:grid-cols-5 gap-3">
          <input placeholder="地点名称" value={newLoc.name} onChange={e => setNewLoc({...newLoc, name: e.target.value})}
            className="px-3 py-2 text-sm border rounded-lg dark:bg-slate-700 dark:border-slate-600" />
          <input placeholder="纬度" value={newLoc.lat} onChange={e => setNewLoc({...newLoc, lat: e.target.value})}
            className="px-3 py-2 text-sm border rounded-lg dark:bg-slate-700 dark:border-slate-600" />
          <input placeholder="经度" value={newLoc.lng} onChange={e => setNewLoc({...newLoc, lng: e.target.value})}
            className="px-3 py-2 text-sm border rounded-lg dark:bg-slate-700 dark:border-slate-600" />
          <select value={newLoc.type} onChange={e => setNewLoc({...newLoc, type: e.target.value as 'visited'|'planned'})}
            className="px-3 py-2 text-sm border rounded-lg dark:bg-slate-700 dark:border-slate-600">
            <option value="planned">计划中</option>
            <option value="visited">已访问</option>
          </select>
          <div className="flex gap-2">
            <button onClick={handleAdd} className="flex-1 px-3 py-2 text-sm bg-green-600 text-white rounded-lg">添加</button>
            <button onClick={() => setIsAdding(false)} className="px-3 py-2 text-sm bg-slate-300 rounded-lg">取消</button>
          </div>
        </div>
      )}

      <div className="h-[500px]">
        <MapContainer center={mapCenter} zoom={4} className="h-full w-full" scrollWheelZoom={true}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
          {showRoute && routePath.length > 1 && <Polyline positions={routePath} color="#3b82f6" weight={3} dashArray="10,10" />}
          {filtered.map(loc => (
            <Marker key={loc.id} position={[loc.lat, loc.lng]} icon={loc.type === 'visited' ? visitedIcon : plannedIcon}>
              <Popup>
                <div className="min-w-[180px]">
                  <h3 className="font-bold">{loc.name}</h3>
                  <p className="text-xs text-slate-500">{loc.type === 'visited' ? '🏁 已访问' : '📍 计划'} · {loc.date}</p>
                  {loc.description && <p className="text-sm my-2">{loc.description}</p>}
                  <div className="flex gap-2 mt-2">
                    {loc.type === 'planned' && <button onClick={() => handleVisit(loc.id)} className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">✓ 已到达</button>}
                    <button onClick={() => handleDelete(loc.id)} className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded">删除</button>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <div className="p-3 border-t bg-slate-50 dark:bg-slate-700/50 flex gap-6 text-sm">
        <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-blue-500" /> 已访问 {locations.filter(l => l.type === 'visited').length}</span>
        <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-amber-500" /> 计划中 {locations.filter(l => l.type === 'planned').length}</span>
      </div>
    </div>
  );
}
