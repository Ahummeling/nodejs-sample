// This file represents a very complex route handler

export const complexModuleHandler = (_req, res) => {
    // Do whatever complex stuff we want

    // Eventually return a json response
    res.status(200).json({
        foo: 'bar',
    });
};