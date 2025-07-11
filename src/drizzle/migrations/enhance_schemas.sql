-- 数据库Schema优化迁移脚本
-- 执行时间: 预计5-10分钟（取决于现有数据量）

-- =====================================================
-- 1. 优化 drawing 表 - 添加性能和功能字段
-- =====================================================

-- 添加新字段到drawing表
ALTER TABLE drawing ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;
ALTER TABLE drawing ADD COLUMN IF NOT EXISTS share_count INTEGER DEFAULT 0;
ALTER TABLE drawing ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE drawing ADD COLUMN IF NOT EXISTS thumbnail TEXT;
ALTER TABLE drawing ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1;
ALTER TABLE drawing ADD COLUMN IF NOT EXISTS collaborators TEXT[] DEFAULT '{}';
ALTER TABLE drawing ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false;
ALTER TABLE drawing ADD COLUMN IF NOT EXISTS last_viewed_at TIMESTAMP;

-- 为新字段创建索引
CREATE INDEX IF NOT EXISTS idx_drawing_view_count ON drawing(view_count);
CREATE INDEX IF NOT EXISTS idx_drawing_tags ON drawing USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_drawing_is_public ON drawing(is_public);
CREATE INDEX IF NOT EXISTS idx_drawing_last_viewed ON drawing(last_viewed_at);

-- =====================================================
-- 2. 优化 folder 表 - 添加视觉和功能字段
-- =====================================================

-- 添加新字段到folder表
ALTER TABLE folder ADD COLUMN IF NOT EXISTS color TEXT DEFAULT '#3B82F6';
ALTER TABLE folder ADD COLUMN IF NOT EXISTS icon TEXT DEFAULT 'folder';
ALTER TABLE folder ADD COLUMN IF NOT EXISTS is_shared BOOLEAN DEFAULT false;
ALTER TABLE folder ADD COLUMN IF NOT EXISTS share_token TEXT;
ALTER TABLE folder ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

-- 为新字段创建索引
CREATE INDEX IF NOT EXISTS idx_folder_is_shared ON folder(is_shared);
CREATE INDEX IF NOT EXISTS idx_folder_share_token ON folder(share_token);
CREATE INDEX IF NOT EXISTS idx_folder_sort_order ON folder(sort_order);

-- =====================================================
-- 3. 创建画图版本历史表
-- =====================================================

CREATE TABLE IF NOT EXISTS drawing_versions (
    id TEXT PRIMARY KEY DEFAULT generate_random_uuid()::text,
    drawing_id TEXT NOT NULL REFERENCES drawing(id) ON DELETE CASCADE,
    version INTEGER NOT NULL,
    data JSONB NOT NULL,
    changes_description TEXT,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    created_by TEXT NOT NULL,
    
    UNIQUE(drawing_id, version)
);

-- 版本表索引
CREATE INDEX IF NOT EXISTS idx_drawing_versions_drawing_id ON drawing_versions(drawing_id);
CREATE INDEX IF NOT EXISTS idx_drawing_versions_created_at ON drawing_versions(created_at);

-- =====================================================
-- 4. 创建画图协作表
-- =====================================================

CREATE TABLE IF NOT EXISTS drawing_collaborators (
    id TEXT PRIMARY KEY DEFAULT generate_random_uuid()::text,
    drawing_id TEXT NOT NULL REFERENCES drawing(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    permission TEXT NOT NULL CHECK (permission IN ('view', 'edit', 'admin')),
    invited_at TIMESTAMP DEFAULT NOW() NOT NULL,
    invited_by TEXT NOT NULL,
    accepted_at TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    
    UNIQUE(drawing_id, user_id)
);

-- 协作表索引
CREATE INDEX IF NOT EXISTS idx_drawing_collaborators_drawing_id ON drawing_collaborators(drawing_id);
CREATE INDEX IF NOT EXISTS idx_drawing_collaborators_user_id ON drawing_collaborators(user_id);
CREATE INDEX IF NOT EXISTS idx_drawing_collaborators_permission ON drawing_collaborators(permission);

-- =====================================================
-- 5. 创建标签管理表
-- =====================================================

CREATE TABLE IF NOT EXISTS tags (
    id TEXT PRIMARY KEY DEFAULT generate_random_uuid()::text,
    name TEXT UNIQUE NOT NULL,
    color TEXT DEFAULT '#6B7280',
    description TEXT,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    created_by TEXT NOT NULL
);

-- 标签表索引
CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name);
CREATE INDEX IF NOT EXISTS idx_tags_usage_count ON tags(usage_count);

-- =====================================================
-- 6. 创建用户活动日志表
-- =====================================================

CREATE TABLE IF NOT EXISTS user_activities (
    id TEXT PRIMARY KEY DEFAULT generate_random_uuid()::text,
    user_id TEXT NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('create', 'update', 'delete', 'view', 'share', 'collaborate')),
    resource_type TEXT NOT NULL CHECK (resource_type IN ('drawing', 'folder', 'user')),
    resource_id TEXT NOT NULL,
    resource_name TEXT,
    metadata JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- 活动日志表索引
CREATE INDEX IF NOT EXISTS idx_user_activities_user_id ON user_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_action ON user_activities(action);
CREATE INDEX IF NOT EXISTS idx_user_activities_resource ON user_activities(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_created_at ON user_activities(created_at);

-- =====================================================
-- 7. 创建文件分享表
-- =====================================================

CREATE TABLE IF NOT EXISTS file_shares (
    id TEXT PRIMARY KEY DEFAULT generate_random_uuid()::text,
    resource_type TEXT NOT NULL CHECK (resource_type IN ('drawing', 'folder')),
    resource_id TEXT NOT NULL,
    share_token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'base64'),
    share_type TEXT NOT NULL CHECK (share_type IN ('public', 'password', 'limited')),
    password_hash TEXT, -- 如果是密码保护
    expires_at TIMESTAMP,
    max_views INTEGER,
    current_views INTEGER DEFAULT 0,
    created_by TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    is_active BOOLEAN DEFAULT true
);

-- 分享表索引
CREATE INDEX IF NOT EXISTS idx_file_shares_resource ON file_shares(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_file_shares_token ON file_shares(share_token);
CREATE INDEX IF NOT EXISTS idx_file_shares_expires_at ON file_shares(expires_at);

-- =====================================================
-- 8. 创建用户偏好设置表
-- =====================================================

CREATE TABLE IF NOT EXISTS user_preferences (
    user_id TEXT PRIMARY KEY,
    theme TEXT DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
    view_mode TEXT DEFAULT 'grid' CHECK (view_mode IN ('grid', 'list')),
    items_per_page INTEGER DEFAULT 20,
    auto_save_interval INTEGER DEFAULT 5, -- 秒
    show_thumbnails BOOLEAN DEFAULT true,
    default_folder_color TEXT DEFAULT '#3B82F6',
    notifications JSONB DEFAULT '{"email": true, "push": false}',
    shortcuts JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- =====================================================
-- 9. 创建系统通知表
-- =====================================================

CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY DEFAULT generate_random_uuid()::text,
    user_id TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('info', 'success', 'warning', 'error')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    action_url TEXT,
    action_text TEXT,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    read_at TIMESTAMP
);

-- 通知表索引
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- =====================================================
-- 10. 添加触发器和函数
-- =====================================================

-- 自动更新 updated_at 字段的触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为相关表添加 updated_at 触发器
DROP TRIGGER IF EXISTS update_drawing_updated_at ON drawing;
CREATE TRIGGER update_drawing_updated_at 
    BEFORE UPDATE ON drawing 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_folder_updated_at ON folder;
CREATE TRIGGER update_folder_updated_at 
    BEFORE UPDATE ON folder 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON user_preferences;
CREATE TRIGGER update_user_preferences_updated_at 
    BEFORE UPDATE ON user_preferences 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 11. 初始化数据
-- =====================================================

-- 为现有画图初始化版本号
UPDATE drawing SET version = 1 WHERE version IS NULL;

-- 为现有文件夹设置默认颜色
UPDATE folder SET color = '#3B82F6' WHERE color IS NULL;
UPDATE folder SET icon = 'folder' WHERE icon IS NULL;

-- 创建默认标签
INSERT INTO tags (name, color, description, created_by) VALUES 
    ('设计', '#EF4444', '设计相关的画图', 'system'),
    ('草图', '#F97316', '快速草图和想法', 'system'),
    ('协作', '#10B981', '团队协作项目', 'system'),
    ('个人', '#6366F1', '个人创作', 'system'),
    ('工作', '#8B5CF6', '工作相关项目', 'system')
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- 12. 创建视图便于查询
-- =====================================================

-- 创建文件夹统计视图
CREATE OR REPLACE VIEW folder_stats AS
SELECT 
    f.id,
    f.name,
    f.user_id,
    COUNT(d.id) as drawing_count,
    MAX(d.updated_at) as last_drawing_updated,
    COUNT(CASE WHEN d.is_public = true THEN 1 END) as public_drawing_count,
    COUNT(CASE WHEN d.is_favorite = true THEN 1 END) as favorite_drawing_count
FROM folder f
LEFT JOIN drawing d ON f.id = d.parent_folder_id AND d.is_deleted = false
WHERE f.is_deleted = false
GROUP BY f.id, f.name, f.user_id;

-- 创建用户活动统计视图
CREATE OR REPLACE VIEW user_activity_stats AS
SELECT 
    user_id,
    COUNT(*) as total_activities,
    COUNT(CASE WHEN action = 'create' THEN 1 END) as creates,
    COUNT(CASE WHEN action = 'update' THEN 1 END) as updates,
    COUNT(CASE WHEN action = 'view' THEN 1 END) as views,
    MAX(created_at) as last_activity
FROM user_activities
GROUP BY user_id;

-- =====================================================
-- 13. 清理和优化
-- =====================================================

-- 分析表以更新统计信息
ANALYZE drawing;
ANALYZE folder;
ANALYZE drawing_versions;
ANALYZE drawing_collaborators;
ANALYZE tags;
ANALYZE user_activities;
ANALYZE file_shares;
ANALYZE user_preferences;
ANALYZE notifications;

-- 添加注释
COMMENT ON TABLE drawing_versions IS '画图版本历史记录表';
COMMENT ON TABLE drawing_collaborators IS '画图协作者权限管理表';
COMMENT ON TABLE tags IS '标签管理表';
COMMENT ON TABLE user_activities IS '用户活动日志表';
COMMENT ON TABLE file_shares IS '文件分享管理表';
COMMENT ON TABLE user_preferences IS '用户偏好设置表';
COMMENT ON TABLE notifications IS '系统通知表';

-- 迁移完成提示
DO $$
BEGIN
    RAISE NOTICE '数据库Schema优化迁移完成！';
    RAISE NOTICE '新增表: drawing_versions, drawing_collaborators, tags, user_activities, file_shares, user_preferences, notifications';
    RAISE NOTICE '新增字段: drawing表添加了view_count, tags等字段，folder表添加了color, icon等字段';
    RAISE NOTICE '建议接下来更新应用代码以使用新的Schema特性';
END $$;