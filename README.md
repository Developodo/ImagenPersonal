# Aplicación de Gestión para el Departamento de Imagen Personal del IES El Tablero

## Descripción

Esta aplicación ha sido desarrollada para el **Departamento de Imagen Personal** del **IES El Tablero**. El objetivo de la aplicación es facilitar la gestión de clientes, la interacción con módulos de enseñanza, la administración de citas y horarios, así como la generación de estadísticas y exportación de datos.

## Funcionalidades

### 1. **Gestión de Clientes**
La aplicación permite la gestión de clientes de forma sencilla. Las funcionalidades principales incluyen:
- **Listado de Clientes:** Visualización de todos los clientes con nombre y apellidos.
- **Filtrado y Búsqueda:** Los usuarios pueden filtrar o buscar clientes por nombre y apellido utilizando un campo de búsqueda.
- **Ficha del Cliente:** Cada cliente tiene una ficha con información detallada que se puede editar, incluyendo la posibilidad de tomar una **foto diferente** para cada **módulo** que el cliente realice, permitiendo así un historial visual por módulo.

### 2. **Módulos y Asignaturas**
La aplicación permite gestionar los módulos de enseñanza, los cuales están directamente relacionados con los clientes. Cada cliente puede tener módulos asignados, con la posibilidad de visualizarlos y gestionarlos de forma ordenada.

- **Visualización de Módulos:** Los módulos y sus claves se extraen dinámicamente de un objeto `Modules.modules`.
- **Gestión de Horarios de Módulos:** Los **profesores** podrán establecer los horarios de los módulos en **mañana** y **tarde**, con la posibilidad de asignar citas a los clientes dentro de esos horarios predefinidos.
- **Gestión de Citas:** Los **profesores** podrán gestionar las citas de los clientes, asignándoles un horario dentro de los establecidos para los módulos.

### 3. **Gestor de Citas y Horarios**
La aplicación incluye un **gestor de citas**, donde los usuarios pueden asignar citas a los clientes dentro de una **agenda de horarios predefinidos**. Los **profesores** podrán establecer los horarios de los módulos en las franjas horarias de **mañana** y **tarde**, y los **clientes** serán asignados a los horarios disponibles.

- **Gestión de Horarios:** Los **profesores** pueden definir los días y horas disponibles para los módulos.
- **Interfaz de Citas:** Los **profesores** pueden asignar citas a los clientes dentro de los horarios predefinidos.

### 4. **Estadísticas**
La aplicación incluye un módulo de **estadísticas** donde se pueden consultar y visualizar datos relacionados con los clientes y los módulos. Esto incluye estadísticas sobre los servicios prestados, la asistencia de los clientes y otros datos relevantes.

### 5. **Exportación de Datos**
Los datos de los clientes, incluidos los módulos y las citas, se pueden exportar a:
- **Excel:** Para obtener una versión procesable de los datos.
- **PDF:** Para generar reportes en formato PDF con el listado de clientes, citas y otros detalles relevantes.

### 6. **Interfaz de Usuario Atractiva**
La aplicación tiene una interfaz visualmente atractiva, utilizando **Angular Material** y un diseño responsive. También cuenta con un sistema de autenticación de seguridad mediante PIN, que asegura el acceso al contenido sensible de la aplicación.

### 7. **Autenticación y Seguridad**
La autenticación de la aplicación está protegida mediante un **PIN**, que es requerido para acceder a las secciones protegidas como la gestión de clientes, citas y módulos. Si se proporciona un PIN incorrecto, se muestra una animación de error.

### 8. **Integración con Firebase**
La aplicación está integrada con **Firebase** para la autenticación, almacenamiento de datos y gestión de la base de datos en tiempo real. Los datos se almacenan de forma segura en **Firestore**, y la aplicación se beneficia de las características de escalabilidad y seguridad proporcionadas por Firebase.

### 9. **Back-End**
La aplicación se conecta a un back-end basado en **Firestore** para almacenar información relacionada con los clientes, citas, módulos y estadísticas. Los datos se gestionan de forma eficiente y se actualizan en tiempo real.
## Tecnologías Utilizadas

- **Angular:** Framework para el desarrollo del front-end.
- **Angular Material:** Biblioteca para componentes UI.
- **Firebase:** Plataforma de desarrollo móvil y web para la autenticación, base de datos en tiempo real y almacenamiento.
- **ExcelJS / XLSX:** Para la exportación de los datos a Excel.
- **jsPDF:** Para la exportación de los datos a PDF.
- **Chart.js:** Para la visualización de las estadísticas en gráficos interactivos. Esta biblioteca permite mostrar datos como la asistencia de clientes, los servicios realizados, etc., en forma de gráficos de barras, líneas, pie, entre otros.

## Cómo Ejecutar el Proyecto

1. Clonar el repositorio:
   ```bash
   git clone https://github.com/tu-usuario/nombre-del-repositorio.git
   ``` 

2. Instalar dependencias:
   ```bash
   npm install
   ``` 

3. Crear el archivo src/environments/environment.ts con las credenciales de tu proyecto Firebase. Este archivo no está incluido por motivos de seguridad y debe ser configurado manualmente con las claves de Firebase y otros valores sensibles.

4. Iniciar la aplicación:
    ```bash
    ng serve
    ``` 

5. Acceder a la aplicación desde http://localhost:4200.

## Licencia
Este proyecto está bajo la Licencia GNU.