<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <!-- 添加角色按钮区域 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="addRoleDialogVisible = true">添加角色</el-button>
        </el-col>
      </el-row>
      <!-- 角色列表区域 -->
      <el-table :data="roleList" border stripe>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row :class="['bdbottom', i1 === 0 ? 'bdtop' : '', 'vcenter']"
                    v-for="(item1, i1) in scope.row.children"
                    :key="item1.id">
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag
                    @close="removeRightById(scope.row, item1.id)"
                    closable
                >{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级和三级权限 -->
              <el-col :span="19">
                <!-- 通过for循环，嵌套渲染二级权限 -->
                <el-row :class="[i2 === 0 ? '' : 'bdtop', 'vcenter']"
                    v-for="(item2, i2) in item1.children"
                    :key="item2.id">
                  <el-col :span="6">
                    <el-tag type="success"
                            @close="removeRightById(scope.row, item2.id)"
                            closable
                    >{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag :class="['bdtop']"
                        v-for="item3 in item2.children"
                        type="warning"
                        @close="removeRightById(scope.row, item3.id)"
                        closable
                        :key="item3.id">{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <!--<template slot-scope="scope">-->
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showRole(scope.row.id)">编辑</el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeRole(scope.row.id)">删除</el-button>
            <el-button type="warning" icon="el-icon-setting" size="mini" @click="showSetRightDialog(scope.row)">分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加角色对话框 -->
    <el-dialog
        title="添加角色"
        :visible.sync="addRoleDialogVisible"
        @close="addRoleDialogClosed"
        width="50%">
      <el-form :model="addRoleForm"
               :rules="addRoleFormRules"
               ref="addRoleFormRef"
               label-width="100px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addRoleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRole">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑角色对话框 -->
    <el-dialog
        title="编辑角色"
        :visible.sync="editDialogVisible"
        @close="editDialogClosed"
        width="50%">
      <el-form :model="editForm"
               :rules="editFormRules"
               ref="editFormRef"
               label-width="100px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRoleInfo">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配权限的对话框 -->
    <el-dialog
        title="分配权限"
        :visible.sync="setRightDialogVisible"
        width="50%">
      <el-tree :data="rightsList"
               show-checkbox
               node-key="id"
               default-expand-all
               ref="treeRef"
               :default-checked-keys="defKeys"
               @close="setRightDialogClosed"
               :props="treeProps"></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    name: 'Roles',
    data () {
      return {
        // 所有角色列表数据
        roleList: [],
        // 添加控制角色对话框显示与隐藏
        addRoleDialogVisible: false,
        // 添加角色表单的数据
        addRoleForm: {
          roleId: '',
          roleName: '',
          roleDesc: ''
        },
        // 添加角色表单的验证规则
        addRoleFormRules: {
          roleName: [
            { required: true, message: '角色名称不能为空', trigger: 'blur' }
          ]
        },
        // 控制编辑角色对话框的显示与隐藏
        editDialogVisible: false,
        // 编辑角色表单的数据
        editForm: {
          roleId: '',
          roleName: '',
          roleDesc: ''
        },
        // 编辑角色的表单验证规则
        editFormRules: {
          roleName: [
            { required: true, message: '角色名称不能为空', trigger: 'blur' }
          ]
        },
        // 控制分配权限对话框的显示与隐藏
        setRightDialogVisible: false,
        // 所有权限的数据
        rightsList: [],
        // 树形控件的属性绑定对象
        treeProps: {
          label: 'authName',
          children: 'children'
        },
        // 默认选中的节点id值数组
        defKeys: [],
        // 当前即将分配权限的角色id
        roleId: ''
      }
    },
    methods: {
      // 获取所有角色的列表
      async getRolesList () {
        const { data: res } = await this.$http.get('roles')
        if (res.meta.status !== 200) {
          return this.$message.error(res.meta.msg || '获取角色列表失败')
        }
        this.roleList = res.data
        console.log(this.roleList)
      },
      // 添加角色对话框的显示与否
      addRoleDialogClosed () {
        this.$refs.addRoleFormRef.resetFields()
      },
      // 添加角色
      addRole () {
        this.$refs.addRoleFormRef.validate(async valid => {
          if (!valid) {
            return
          }
          const { data: res } = await this.$http.post('roles', {
            roleName: this.addRoleForm.roleName,
            roleDesc: this.addRoleForm.roleDesc
          })
          if (res.meta.status !== 201) {
            return this.$message.error(res.meta.msg || '添加角色失败！')
          }
          this.getRolesList()
          this.$message.success(res.meta.msg || '添加角色成功！')
          this.addRoleDialogVisible = false
        })
      },
      // 编辑角色对话框内容的重置
      editDialogClosed () {
        this.$refs.editFormRef.resetFields()
      },
      // 编辑角色对话框的显示
      async showRole (id) {
        const { data: res } = await this.$http.get('roles/' + id)
        if (res.meta.status !== 200) {
          return this.$message.error(res.meta.msg || '获取角色信息失败')
        }
        console.log(res.data)
        this.editForm = res.data
        this.editDialogVisible = true
      },
      // 点击按钮，发送修改角色信息请求
      editRoleInfo () {
        this.$refs.editFormRef.validate(async valid => {
          if (!valid) {
            return
          }
          const { data: res } = await this.$http.put('roles/' + this.editForm.roleId, {
            roleName: this.editForm.roleName,
            roleDesc: this.editForm.roleDesc
          })
          console.log(res)
          if (res.meta.status !== 200) {
            return this.$message.error(res.meta.msg || '修改角色信息失败')
          }
          this.editDialogVisible = false
          this.getRolesList()
          this.$message.success(res.meta.msg || '修改角色信息成功')
        })
      },
      // 删除角色信息
      async removeRole (id) {
        const confirmResult = await this.$confirm('是否删除当前角色?', '删除角色', {
          confirmButtonText: '确定删除',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(error => error)
        if (confirmResult !== 'confirm') {
          return this.$message.info('已取消删除当前角色')
        }
        const { data: res } = await this.$http.delete('roles/' + id)
        if (res.meta.status !== 200) {
          return this.$message.error(res.meta.msg || '删除角色失败')
        }
        this.$message.success(res.meta.msg || '删除角色成功')
        this.getRolesList()
        console.log(res)
      },
      // 根据id删除对应的权限
      async removeRightById (role, rightId) {
        // 弹框提示用户是否要删除
        const confirmResult = await this.$confirm('是否删除角色当前权限?', '提示', {
          confirmButtonText: '确定删除',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(error => error)
        if (confirmResult !== 'confirm') {
          return this.$message.info('取消删除角色当前权限')
        }
        const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
        if (res.meta.status !== 200) {
          return this.$message.error(res.meta.msg || '删除权限失败')
        }
        this.$message.success(res.meta.msg || '删除权限成功')
        // this.getRolesList()
        role.children = res.data
      },
      // 展示分配权限的对话框
      async showSetRightDialog (role) {
        this.roleId = role.id
        // 获取所有权限的数据
        const { data: res } = await this.$http.get('rights/tree')
        if (res.meta.status !== 200) {
          return this.$message.error(res.meta.msg || '获取权限数据失败')
        }
        // 把获取到的权限数据保存到data中
        this.rightsList = res.data
        console.log(this.rightsList)
        // 递归获取三级节点的id值
        this.getLeafKeys(role, this.defKeys)
        this.setRightDialogVisible = true
      },
      // 根据递归的形式，获取角色下所有三级权限的id，并保存到数组
      getLeafKeys (node, arr) {
        if (!node.children) {
          // 如果当前node节点不包含children属性，则是三级节点
          return arr.push(node.id)
        }
        node.children.forEach(item => this.getLeafKeys(item, arr))
      },
      // 监听分配权限对话框的关闭事件
      setRightDialogClosed () {
        this.defKeys = []
      },
      // 点击为角色分配权限
      async allotRights () {
        const keys = [
          ...this.$refs.treeRef.getCheckedKeys(),
          ...this.$refs.treeRef.getHalfCheckedKeys()
        ]
        const idStr = keys.join(',')
        const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, {
          rids: idStr
        })
        if (res.meta.status !== 200) {
          return this.$message.error(res.meta.msg || '分配权限失败')
        }
        this.$message.success(res.meta.msg || '分配权限成功')
        this.getRolesList()
        this.setRightDialogVisible = false
      }
    },
    created () {
      // 获取所有角色的列表数据
      this.getRolesList()
    }
  }
</script>

<style lang="less" scoped>
.el-tag{
  margin: 7px;
}
.bdtop{
  border-top: 1px solid #eee;
}

.bdbottom{
  border-bottom: 1px solid #eee;
}

.vcenter{
  display: flex;
  align-items: center;
}
</style>
