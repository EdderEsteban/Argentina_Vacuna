const { Laboratorio } = require('../models');

const labo = {}

// Listar laboratorios
labo.listar = async (req, res) => {
    try {
        const laboratorios = await Laboratorio.findAll({
            order: [['nombre', 'ASC']]
        });
        res.render('laboratorio/listadoLaboratorio', {
            laboratorios
        });

    } catch (error) {
        console.error('Error al listar laboratorios:', error);
        res.redirect('/404');
    }
}

// Mostrar formulario de creación
labo.mostrarNuevo = async (req, res) => {
    try {
        console.log('Cargando formulario de nuevo laboratorio');
        res.render('laboratorio/nuevoLaboratorio');
    } catch (error) {
        console.error('Error al cargar formulario de nuevo laboratorio:', error);
        res.redirect('/404');
    }
}

// Crear nuevo laboratorio
labo.crearLaboratorio = async (req, res) => {
    try {
        const laboratorio = await Laboratorio.create({
            nombre: req.body.nombre.trim(),
            nacionalidad: req.body.nacionalidad.trim()
        });
        
        // Respuesta para AJAX (Fetch)
        res.status(201).json({ 
            success: true,
            message: 'Laboratorio creado exitosamente',
            data: laboratorio
        });

    } catch (error) {
        console.error('Error detallado:', JSON.stringify(error, null, 2));
        // Manejo de errores de Sequelize
        const errores = error.errors?.map(err => ({
            campo: err.path,
            mensaje: err.message
        })) || [{ mensaje: 'Error desconocido' }];

        res.status(400).json({
            success: false,
            message: 'Error al crear laboratorio',
            errores
        });
    }
};

// Mostrar formulario de edición
labo.editarLaboratorio = async (req, res) => {
    try {
        console.log('Cargando vista laboratorio con ID:', req.params.id);
        const laboratorio = await Laboratorio.findByPk(req.params.id);

        if (!laboratorio) {
            console.error('Laboratorio no encontrado con ID:', req.params.id);
            return res.redirect('laboratorio/listadoLaboratorio');
        }

        res.render('laboratorio/modificarLaboratorio', {
            laboratorio
        });

    } catch (error) {
        console.error('Error al cargar formulario de edición:', error);
        res.redirect('/404');
    }
}

// Actualizar laboratorio
labo.actualizarLaboratorio = async (req, res) => {
    try {
        const laboratorio = await Laboratorio.findByPk(req.params.id);

        await laboratorio.update({
            nombre: req.body.nombre.trim(),
            nacionalidad: req.body.nacionalidad.trim()
        });
        res.redirect('/laboratorios');

    } catch (error) {
        console.error('Error al actualizar laboratorio:', error);
        const errores = error.errors?.map(err => err.message) || ['Error al actualizar el laboratorio'];
        res.redirect(`/editarlaboratorio/${id}`);
    }
}

// Eliminar laboratorio (soft delete)
labo.eliminarLaboratorio = async (req, res) => {
    try {
        console.log('Eliminando laboratorio con ID:', req.params.id);
        await Laboratorio.destroy({
            where: { id: req.params.id }
        });
        //mensaje sweet alert
        res.redirect('/laboratorios');

    } catch (error) {
        console.error('Error al eliminar laboratorio:', error);
        // mensaje sweet alert
        res.redirect('/laboratorios');
    }
}


module.exports = labo;

