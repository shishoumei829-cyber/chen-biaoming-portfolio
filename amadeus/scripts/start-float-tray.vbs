' 静默启动（调用 bat，避免 VBScript 变量错误）
Option Explicit
Dim sh, fso, root, bat
Set sh = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
root = fso.GetParentFolderName(fso.GetParentFolderName(WScript.ScriptFullName))
bat = root & "\scripts\start-float-tray.bat"
If Not fso.FileExists(bat) Then
  MsgBox "找不到: " & bat, 16, "Amadeus"
  WScript.Quit 1
End If
sh.CurrentDirectory = root
sh.Run "cmd /c """ & bat & """", 0, False
